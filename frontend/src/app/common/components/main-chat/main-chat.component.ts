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

import { ChatApiService } from '../../services/chat-api.service';
import { MessageService } from '../../services/message.service';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { IMeme } from 'src/app/models/file/meme.interface';
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

  chatList$: Observable<string[]>;

  newMessagesCount: Map<string,number> = new Map();

  currentTab: string;

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

  get isMainTab(): boolean {
    return !this.currentTab;
  }

  get messageToReply(): IRepliedMessage[] {
    return this.commonService.messageToReply;
  }

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly ngZone: NgZone,//TODO remove
    private readonly chatApiService: ChatApiService,
    private readonly authService: AuthService,
    private readonly userStatusService: UserStatusService,
    private readonly commonService: MessageService,
    private readonly imageService: ImageService
  ) { }

  getSrcFromImage = (image: IImage) => {
    if (!image?.picByte) return null;
    return `data:image/jpeg;base64,${image.picByte}`;
  };

  ngOnInit(): void {
    this.form = this.fb.group({
      message: []
    });

    this.userStatusService.setUserStatusesExpireScheduler();

    this.chatList$ = this.commonService.messages$
      .pipe(
        map((list) => {
          if (!list) return null;
          return Array.from(list.keys()).map((key) => key || this.mainChatTitle)
        })
      );

    this.setMainChatMessages();

    this.commonService.newMessages$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((counts) => {
        const count = counts.get(this.isMainTab ? null : this.currentTab);
        if (count > 0) this.scrollToBot();
        this.newMessagesCount = counts;
      });

    this.commonService.scrollQueue$
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

    this.getLastMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.commonService.clearMessageToReply();
  }

  submit(text: string, meme?: IMeme): void {
    this.lastMessage = text;

    const newDate =  new Date();
    const newMessage = new ChatMessage(
      this.authService.getCurrentUser(),
      text, newDate, this.messageToReply, meme?.name || null
    );

    this.chatApiService.addMessage(newMessage)
      .pipe(
        finalize(() => {
          this.commonService.clearMessageToReply();
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
    this.commonService.removeMessageFromReply(message);
  }

  changeChat(chatName: string): void {
    if (this.currentTab === chatName) return;

    this.currentTab = chatName;

    if (chatName === this.mainChatTitle) {
      this.setMainChatMessages();
      this.getLastMessages();
      this.newMessagesCount.set(null, 0);
    } else {
      this.messages$ = this.commonService.getPrivateMessagesOfUser(chatName);
      this.newMessagesCount.set(chatName, 0);
    }
  }

  getNewMessageCount(chatName: string): number {
    const key = chatName === this.mainChatTitle ? null : chatName;
    return this.newMessagesCount.get(key);
  }

  loadPrevious(): void {
    this.getLastMessages(this.defaultPageSize);
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
        this.commonService.pushLastMessages(messages);
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
          this.commonService.pushLastMessages(messages);
          this._currentPageSize = messages.length;
        });
    }
  }

  scrollDown(): void {
    this.highlightMessageId = undefined;
    if (this.prevScrollMessageId) {
      this.commonService.goToPrevMessage();
    } else {
      this.scrollToBot();
    }
  }

  addImage(): void {
    this.imageService.loadAllMemes();
    this.memeList$ = this.imageService.getMemeList();
    this.addImageDialog.open();
  }

  private getLastMessages(size = 0): void {
    this.chatApiService.getLastMessages(this._currentPageSize + size)
      .pipe(
        finalize(() => {
          if (!size) this.scrollToBot();
        }),
        switchMap((response) => of(response.reverse())),
        takeUntil(this.destroy$)
      ).subscribe((messages) => {
        this.commonService.pushLastMessages(messages);
        this._currentPageSize = messages.length;
      });
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

  private setMainChatMessages(): void {
    this.messages$ = this.commonService.getMainMessages()
      .pipe(
        map((messages) => {
          return messages?.map((m) => {
            console.log(`Generate new message hash...`);
            m.messageHash = HashService.cyrb53(m.text + m.oldText);
            return m
          })
        })
      );
  }
}
