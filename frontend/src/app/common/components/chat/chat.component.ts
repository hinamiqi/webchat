import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/models/auth/user.model';
import { IMessage } from 'src/app/models/message/message.interface';
import { ChatMessage } from 'src/app/models/message/message.model';
import { GlobalEventWebSocketType, IGlobalEvent } from 'src/app/models/websocket/global-event.interface';
import { UserStatusService } from 'src/app/shared/services/user-status.service';
import { WebSocketService } from 'src/app/shared/services/web-socket.service';

import { ChatApiService } from '../../services/chat-api.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;

  messages: IMessage[] = [];

  lastMessage: string;

  private destroy$ = new Subject<void>();

  get messageControl(): AbstractControl {
    return this.form?.get('message');
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document,
    private readonly chatApiService: ChatApiService,
    private readonly authService: AuthService,
    private readonly websocketService: WebSocketService,
    private readonly userStatusService: UserStatusService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      message: []
    });
    this.getLastMessages();

    this.listenToWebSocketMessages();

    this.userStatusService.setUserStatusesExpireScheduler();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.scrollToBot();
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

  private getLastMessages(): void {
    this.chatApiService.getLastMessages()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.messages = response.reverse();
      });
  }

  private scrollToBot(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const container = this.document.querySelector('.messages-container');
        container.scroll({
          top: container.scrollHeight,
          behavior: 'auto',
        });
      }, 100);
    });
  }

  private listenToWebSocketMessages(): void {
    this.websocketService.watchOnUserMessage()
    .pipe(takeUntil(this.destroy$))
    .subscribe((message) => {
      this.messages.push(message.data);
      this.messageControl.patchValue(null);
      this.scrollToBot();
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
