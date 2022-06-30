import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, Inject, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';

import { Observable, of, Subject } from 'rxjs';
import { finalize, map, switchMap, takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/auth/services/auth.service';
import { IMessage } from 'src/app/models/message/message.interface';
import { ChatMessage } from 'src/app/models/message/message.model';
import { UserStatusService } from 'src/app/shared/services/user-status.service';
import { WebSocketService } from 'src/app/shared/services/web-socket.service';

import { ChatApiService } from '../../services/chat-api.service';
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-chat',
  templateUrl: './main-chat.component.html',
  styleUrls: ['./main-chat.component.scss']
})

export class MainChatComponent implements OnInit, OnDestroy {
  @ViewChild('chat') messageContainer: ElementRef;

  form: UntypedFormGroup;

  messages$: Observable<IMessage[]> = of([]);

  lastMessage: string;

  mainChatTitle = 'Great patriots';

  chatList$: Observable<string[]>;

  newMessagesCount: Map<string,number> = new Map();

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
    private readonly chatApiService: ChatApiService,
    private readonly authService: AuthService,
    private readonly userStatusService: UserStatusService,
    private readonly commonService: CommonService
  ) { }

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

    this.messages$ = this.commonService.getMainMessages();

    this.commonService.newMessages$
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((counts) => {
        const count = counts.get(this.isMainTab ? null : this.currentTab);
        if (count > 0) this.scrollToBot();
        this.newMessagesCount = counts;
      });

    this.getLastMessages();
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
    if (this.currentTab === chatName) return;

    this.currentTab = chatName;

    if (chatName === this.mainChatTitle) {
      this.messages$ = this.commonService.getMainMessages();
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

  private getLastMessages(): void {
    this.chatApiService.getLastMessages()
      .pipe(
        finalize(() => {
          this.scrollToBot();
        }),
        switchMap((response) => of(response.reverse())),
        takeUntil(this.destroy$)
      ).subscribe((messages) => {
        this.commonService.pushLastMessages(messages);
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
}