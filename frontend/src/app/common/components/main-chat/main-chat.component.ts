import { Component, ElementRef, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { Observable, of, Subject } from 'rxjs';
import { filter, finalize, map, switchMap, takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/auth/services/auth.service';
import { IImage } from 'src/app/models/file/image.interface';
import { IMessage, IRepliedMessage } from 'src/app/models/message/message.interface';
import { ChatMessage } from 'src/app/models/message/message.model';
import { SimpleDialogComponent } from 'src/app/shared/components/simple-dialog/simple-dialog.component';
import { DEFAULT_CHAT_PAGE_SIZE } from 'src/app/shared/constants/settings.const';
import { UserStatusService } from 'src/app/shared/services/user-status.service';
import { HashService } from 'src/app/utils/services/hash.service';
import { User } from 'src/app/models/auth/user.model';
import { IMeme } from 'src/app/models/file/meme.interface';
import { LocalStorageService } from 'src/app/utils/services/local-storage.service';
import { StorageTypes } from 'src/app/auth/constants/storage-types.constant';

import { ChatApiService } from '../../services/chat-api.service';
import { IChat, MAIN_CHAT_ID, MessageService } from '../../services/message.service';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ImageService } from '../../services/image.service';

@Component({
  selector: 'app-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss']
})

export class MainChatComponent implements OnInit, OnDestroy {
  @ViewChild('chat') messageContainer: ElementRef;

  @ViewChild('addImageDialog') addImageDialog: SimpleDialogComponent;

  @ViewChildren(ChatMessageComponent) set messageQueryList(val: QueryList<ChatMessageComponent>) {
    if (!!this.messageToScrollId) {
      this.scrollToMessage(this.messageToScrollId);
    }
    this._messageQueryList = val;
  }
  get messageQueryList(): QueryList<ChatMessageComponent> {
    return this._messageQueryList;
  }
  _messageQueryList: QueryList<ChatMessageComponent>;

  form: UntypedFormGroup;

  messages$: Observable<IMessage[]> = of([]);

  messages: IMessage[] = [];

  lastMessage: string;

  mainChatTitle = 'Great patriots';

  chatList: IChat[];

  newMessagesCount: Map<string,number>;

  scrollToDate: string;

  prevScrollMessageId: number;

  messageToScrollId: number;

  highlightMessageId: number;

  showScrollDown = false;

  memeList$: Observable<IMeme[]>;

  messageTrackByFn = (_: number, item: IMessage): string => item.messageHash;

  readonly defaultPageSize = DEFAULT_CHAT_PAGE_SIZE;

  private _currentPageSize = this.defaultPageSize;

  private destroy$ = new Subject<void>();

  get messageControl(): AbstractControl {
    return this.form?.get('message');
  }

  get messageToReply(): IRepliedMessage[] {
    return this.messageService.messageToReply;
  }

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly ngZone: NgZone,//TODO remove
    private readonly chatApiService: ChatApiService,
    private readonly authService: AuthService,
    private readonly userStatusService: UserStatusService,
    private readonly messageService: MessageService,
    private readonly imageService: ImageService,
    private readonly localStorageService: LocalStorageService,
  ) { }

  getSrcFromImage = (image: IImage) => {
    if (!image?.picByte) return null;
    return `data:image/jpeg;base64,${image.picByte}`;
  };

  getIsActiveTab(index: number): boolean {
    return this.messageService.isActiveChat(index);
  }

  ngOnInit(): void {
    this.loadChats();
    this.changeChat(0);

    this.form = this.fb.group({
      message: []
    });

    this.userStatusService.setUserStatusesExpireScheduler();

    this.setChatMessages();

    this.chatList = this.messageService.chatList;

    this.messageService.scrollQueue$
      .pipe(
        filter((queue) => !!queue),
        takeUntil(this.destroy$)
      )
      .subscribe((queue) => {
        if (queue.length > 1) {
          this.prevScrollMessageId = queue[queue.length - 2];
          this.highlightMessageId = queue[queue.length - 1];
        } else {
          this.prevScrollMessageId = undefined;
        }

        this.scrollToMessage(queue[queue.length - 1]);
      });
    
    this.messageService.newMessages$
      .pipe(
        filter((queue) => !!queue),
        takeUntil(this.destroy$)
      )
      .subscribe((newMessages) => {
        const id = this.messageService.currentChat.id;
        if (this.newMessagesCount?.get(id) !== newMessages.get(id) && newMessages.get(id) !== 0) {
          this.messageService.clearNewMessageCounter(id);
        }
        this.newMessagesCount = new Map(newMessages);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.messageService.clearMessageToReply();
  }

  submit(text: string, meme?: IMeme): void {
    this.lastMessage = text;
    const currentChat = this.messageService.currentChat;
    const receiver = currentChat.isPrivate
      ? { uuid: currentChat.userUuid }
      : null;

    const newDate =  new Date();
    const newMessage = new ChatMessage(
      this.authService.getCurrentUser(),
      receiver,
      text, newDate, this.messageToReply, meme?.name || null
    );

    const request$ = currentChat.isPrivate
      ? this.chatApiService.addMessageToUser(newMessage, receiver.uuid)
      : this.chatApiService.addMessage(newMessage)

    request$
      .pipe(
        finalize(() => {
          this.messageService.clearMessageToReply();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.lastMessage = null;
      });
  }

  submitMeme(meme: IMeme): void {
    console.log(`Submit meme ${meme.name} containing image ${meme.image.name}`);
    this.submit(null, meme);
    this.addImageDialog.close();
  }

  removeMessage(message: IMessage): void {
    if (!confirm('Are you sure you want to remove this message?')) return;

    this.chatApiService.removeMessage(message.id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {});
  }

  removeReply(message: IRepliedMessage): void {
    this.messageService.removeMessageFromReply(message);
  }

  changeChat(index: number): void {
    this.messageService.changeChat(index);
    this.scrollDown();
  }

  closeChat(chatId: string): void {
    const needToScrollDown = this.messageService.closeChat(chatId);
    this.chatList = this.messageService.chatList;
    this.saveChats();
    if (needToScrollDown) {
      this.scrollDown();
    }
  }

  openPrivateChat(user: User): void {
    this.messageService.activatePrivateChat(user);
    this.chatList = this.messageService.chatList;
    this.saveChats();
  }

  loadPrevious(): void {
    this._currentPageSize += this.defaultPageSize;
    this.messageService.fetchMessagesFromServer(this._currentPageSize);
  }

  goToDate(): void {
    if (!this.scrollToDate) return;

    const parsed = Date.parse(this.scrollToDate);
    const date = new Date(parsed);

    this.chatApiService.getMessageToDate(date)
      .pipe(
        switchMap((response) => of(response.reverse())),
        takeUntil(this.destroy$)
      ).subscribe((messages) => {
        this.messageService.pushLastMessages(messages);
        this._currentPageSize = messages.length;
      });
  }

  chatScrolled(): void {
    this.showScrollDown = !this.isScrolledToBot();
  }

  scrollToMessage(messageId: number): void {
    const messageToScroll = this.messageQueryList.find((m) => m.message.id === messageId);
    if (!!messageToScroll) {
      this.messageToScrollId = undefined;
      this.scrollMessageToView(messageToScroll);
    } else {
      this.messageToScrollId = messageId;
      this.chatApiService.getToMessage(messageId)
        .pipe(
          switchMap((response) => of(response.reverse())),
          takeUntil(this.destroy$)
        ).subscribe((messages) => {
          this.messageService.pushLastMessages(messages);
          this._currentPageSize = messages.length;
        });
    }
  }

  scrollDown(): void {
    this.highlightMessageId = undefined;
    if (this.prevScrollMessageId) {
      this.messageService.goToPrevMessage();
    } else {
      this.scrollToBot();
    }
  }

  addImage(): void {
    this.imageService.loadAllMemes();
    this.memeList$ = this.imageService.getMemeList();
    this.addImageDialog.open();
  }

  private scrollToBot(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.messageContainer.nativeElement.scroll({
          top: this.messageContainer.nativeElement.scrollHeight,
          behavior: 'auto',
        });
      }, 100);
    });
  }

  private scrollMessageToView(message: ChatMessageComponent): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        message.elementRef.nativeElement.scrollIntoView({behavior: 'smooth'});
        this.chatScrolled();
      }, 100);
    });
  }

  private isScrolledToBot(): boolean {
    if (!this.messageContainer) return true;
    return this.messageContainer.nativeElement.scrollHeight - this.messageContainer.nativeElement.clientHeight === this.messageContainer.nativeElement.scrollTop;
  }

  private setChatMessages(): void {
    this.messages$ = this.messageService.getMessages()
      .pipe(
        map((messages) => {
          return messages?.map((m) => {
            console.log(`Generate new message hash...`);
            m.messageHash = HashService.cyrb53(m.text + m.oldText);
            return m;
          })
        })
      );
  }

  private loadChats(): void {
    const openedChats = this.localStorageService.getItem(StorageTypes.OPENED_CHATS) as IChat[];
    if (!!openedChats && openedChats.length) {
      this.messageService.loadChatList(openedChats);
    }
  }

  private saveChats(): void {
    const chatsToSave = this.messageService.chatList.filter((c) => c.id !== MAIN_CHAT_ID);
    if (chatsToSave.length) {
      this.localStorageService.setItem(StorageTypes.OPENED_CHATS, chatsToSave);
    }
  }
}
