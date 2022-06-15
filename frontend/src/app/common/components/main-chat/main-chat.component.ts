import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/models/auth/user.model';
import { IMessage } from 'src/app/models/message/message.interface';
import { ChatMessage } from 'src/app/models/message/message.model';
import { GlobalEventWebSocketType, IGlobalEvent } from 'src/app/models/websocket/global-event.interface';
import { UserStatusService } from 'src/app/shared/services/user-status.service';
import { WebSocketService } from 'src/app/shared/services/web-socket.service';

import { ChatApiService } from '../../services/chat-api.service';
import { CommonService } from '../../services/common.service';
import { IChatMessageConfig } from '../chat-message/chat-message-config.model';

@Component({
  selector: 'app-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss']
})

export class MainChatComponent implements OnInit, OnDestroy {
  @ViewChild('chat') messageContainer: ElementRef;

  form: UntypedFormGroup;

  messages: IMessage[] = [];

  lastMessage: string;

  mainChatTitle = 'Great patriots';

  chatList$: Observable<string[]>;

  currentTab: string;

  private destroy$ = new Subject<void>();

  get messageControl(): AbstractControl {
    return this.form?.get('message');
  }

  get isMainTab(): boolean {
    return !this.currentTab;
  }

  constructor(
    private readonly fb: UntypedFormBuilder,
    private readonly ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document,
    private readonly chatApiService: ChatApiService,
    private readonly authService: AuthService,
    private readonly websocketService: WebSocketService,
    private readonly userStatusService: UserStatusService,
    private readonly commonService: CommonService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      message: []
    });
    this.getLastMessages();

    this.listenToWebSocketMessages();

    this.userStatusService.setUserStatusesExpireScheduler();

    this.chatList$ = this.commonService.privateMessages$
      .pipe(
        map((list) => list ? Array.from(list.keys()) : null)
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(text: string): void {
    if (!text) return;

    const newMessage = new ChatMessage(
      this.authService.getCurrentUser(),
      text, new Date()
    );

    this.chatApiService.addMessage(newMessage)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.lastMessage = null;
      });
  }

  removeMessage(message: IMessage): void {
    if (!confirm('Are you sure you want to remove this message?')) return;

    this.chatApiService.removeMessage(message.id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe(() => {});
  }

  changeChat(chatName: string): void {
    this.currentTab = chatName;
    if (!!this.currentTab) {
      this.messages = this.commonService.getPrivateMessagesOfUser(chatName);
    } else {
      this.getLastMessages();
    }
  }

  private getLastMessages(): void {
    this.chatApiService.getLastMessages()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.messages = response.reverse();
        this.scrollToBot();
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

  private listenToWebSocketMessages(): void {
    this.websocketService.watchOnUserMessage()
      .pipe(
        filter(() => this.isMainTab), //TODO: We should get main messages on any tab!
        takeUntil(this.destroy$)
      )
      .subscribe((message) => {
        this.messages.push(message.data);
        this.messageControl.patchValue(null);
        this.scrollToBot();
      });

    this.websocketService.watchOnPrivateUserMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        this.commonService.pushPrivateMessage(message.data);
      });

    this.websocketService.watchOnUserErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe((err) => {
        console.log(err);
      });

    this.websocketService.watchOnGlobalEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        console.log(`Recieved GLOBAL_EVENT of type ${event.type}: `, event.data);
        this.handleGlobalEvent(event);
      });
  }

  private handleGlobalEvent(event: IGlobalEvent): void {
    switch (event.type) {
      case GlobalEventWebSocketType.MESSAGE_DELETED:
        this.removeMessageFromStack(<IMessage>event.data);
        break;
      case GlobalEventWebSocketType.USER_ACTIVITY:
        if (!!(<User>event.data).uuid) {
          this.userStatusService.userActivity(event.data);
        }
        break;
      case GlobalEventWebSocketType.MESSAGE_EDITED:
        if (!this.authService.isCurrentUser((<IMessage>event.data).author)) {
          this.editMessageInStack(<IMessage>event.data);
        }
        break;
      default:
        break;
    }
  }

  private removeMessageFromStack(message: IMessage) {
    this.messages = this.messages.filter((m) => m.id !== message.id);
  }

  private editMessageInStack(message: IMessage) {
    const oldMessage = this.messages.find((m) => m.id === message.id);

    if (!!oldMessage) {
      oldMessage.text = message.text;
      oldMessage.oldText = message.oldText;
    }
  }
}
