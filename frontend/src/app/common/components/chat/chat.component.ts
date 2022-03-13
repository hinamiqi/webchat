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

  messages: IMessage[] = [
    {
      text: '123456',
      authorName: 'User',
      date: new Date()
    },
    {
      text: '123456 asfdadsdadas da',
      authorName: 'User',
      date: new Date()
    },
    {
      text: '1234561233333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333',
      authorName: 'User',
      date: new Date()
    },
    {
      text: '1234561233333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333 asdd 12333333333333333333333333333333333',
      authorName: 'User',
      date: new Date()
    },
    {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ac enim volutpat, sollicitudin metus vitae, consectetur ante. Mauris sollicitudin hendrerit odio, vel iaculis tellus tincidunt vel. Morbi eget suscipit neque. Quisque et accumsan nunc. Praesent at arcu ac nunc viverra rutrum. In faucibus arcu vel quam ornare, sed porttitor ex mollis. Etiam eu ex augue. Integer sit amet blandit lectus, id vehicula nibh. Pellentesque faucibus justo vel nisi tempus venenatis. Vestibulum eget massa ligula. Vestibulum vitae lectus eget odio euismod vulputate. Duis tincidunt dui et commodo tincidunt. Maecenas suscipit ac ipsum quis tristique. Donec placerat odio euismod faucibus efficitur."; asdd 12333333333333333333333333333333333',
      authorName: 'User',
      date: new Date()
    },
  ];

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
    this.chatApiService.pushNewMessage(newMessage)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.messages.push(response);
        this.messageControl.patchValue(null);
        this.scrollToBot();
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
