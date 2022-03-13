import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, NgZone, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';

import { IMessage } from 'src/app/models/message/message.interface';
import { ChatMessage } from 'src/app/models/message/message.model';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})

export class ChatComponent implements OnInit, AfterViewInit {
  form: FormGroup;

  messages: IMessage[] = [
    {
      text: '123456',
      authorId: 'User',
      date: new Date()
    },
    {
      text: '123456 asfdadsdadas da',
      authorId: 'User',
      date: new Date()
    },
    {
      text: '1234561233333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333',
      authorId: 'User',
      date: new Date()
    },
    {
      text: '1234561233333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333 asdd 12333333333333333333333333333333333',
      authorId: 'User',
      date: new Date()
    },
    {
      text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut ac enim volutpat, sollicitudin metus vitae, consectetur ante. Mauris sollicitudin hendrerit odio, vel iaculis tellus tincidunt vel. Morbi eget suscipit neque. Quisque et accumsan nunc. Praesent at arcu ac nunc viverra rutrum. In faucibus arcu vel quam ornare, sed porttitor ex mollis. Etiam eu ex augue. Integer sit amet blandit lectus, id vehicula nibh. Pellentesque faucibus justo vel nisi tempus venenatis. Vestibulum eget massa ligula. Vestibulum vitae lectus eget odio euismod vulputate. Duis tincidunt dui et commodo tincidunt. Maecenas suscipit ac ipsum quis tristique. Donec placerat odio euismod faucibus efficitur."; asdd 12333333333333333333333333333333333',
      authorId: 'User',
      date: new Date()
    },
  ];

  get messageControl(): AbstractControl {
    return this.form?.get('message');
  }

  constructor(
    private readonly fb: FormBuilder,
    private readonly ngZone: NgZone,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      message: []
    });

  }

  ngAfterViewInit(): void {
    this.scrollToBot();
  }

  submit(): void {
    if (!this.messageControl.value) return;

    const newMessage = new ChatMessage('User', this.messageControl.value, new Date());

    this.messages.push(newMessage);

    this.messageControl.patchValue(null);

    this.scrollToBot();
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
