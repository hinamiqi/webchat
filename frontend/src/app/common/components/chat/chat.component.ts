import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/auth/services/auth.service';
import { IMessageView } from 'src/app/models/message/message.interface';
import { ChatMessage } from 'src/app/models/message/message.model';
import { WebSocketService } from 'src/app/shared/services/web-socket.service';

import { ChatApiService } from '../../services/chat-api.service';
import { ChatService } from '../../services/chat.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;

  messages: IMessageView[] = [];

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
    private readonly chatService: ChatService,
    private readonly websocketService: WebSocketService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      message: []
    });
    this.getLastMessages();

    this.websocketService.watchOnUserMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        this.messages.push(this.chatService.getChatMessageView(message.data));
        this.messageControl.patchValue(null);
        this.scrollToBot();
      });

    this.websocketService.watchOnUserErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe((err) => {
        console.log(err);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.scrollToBot();
  }

  submit(): void {
    if (!this.messageControl.value) return;

    const newMessage = new ChatMessage(
      this.authService.getCurrentUser(),
      this.messageControl.value, new Date()
    );

    this.websocketService.sendUserMessage(newMessage);
  }

  submitIfNeeded(event: KeyboardEvent): void {
    if (event.code === 'Enter' && !event.shiftKey) {
      this.submit();
    }
  }

  removeMessage(message: IMessageView): void {
    if (!confirm('Are you sure you want to remove this message?')) return;

    this.chatApiService.removeMessage(message.id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.messages = this.messages.filter((m) => m.id !== response.id);
      });
  }

  private getLastMessages(): void {
    this.chatApiService.getLastMessages()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.messages = response
          .map((serverMsg) =>
            this.chatService.getChatMessageView(serverMsg)
          )
          .reverse();
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
}
