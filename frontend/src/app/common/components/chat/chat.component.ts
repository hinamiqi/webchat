import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IMessage } from 'src/app/models/message/message.interface';
import { ChatMessage } from 'src/app/models/message/message.model';
import { ChatApiService } from '../../services/chat-api.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit, OnDestroy, AfterViewInit {
  form: FormGroup;

  messages: IMessage[] = [];

  private destroy$ = new Subject<void>();

  get messageControl(): AbstractControl {
    return this.form?.get('message');
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document,
    private readonly chatApiService: ChatApiService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      message: []
    });
    this.getLastMessages();
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

    // FIXME: we should send current user
    const newMessage = new ChatMessage('admin', this.messageControl.value, new Date());
    this.chatApiService.addMessage(newMessage)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.messages.push(response);
        this.messageControl.patchValue(null);
        this.scrollToBot();
      });
  }

  private getLastMessages(): void {
    this.chatApiService.getLastMessages()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.messages = response;
      });
  }

  private scrollToBot(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        const container = this.document.querySelector('.message-container');
        container.scroll({
          top: container.scrollHeight,
          behavior: 'auto',
        });
      }, 100);
    });
  }
}
