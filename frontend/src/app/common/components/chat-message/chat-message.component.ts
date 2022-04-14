import { Component, EventEmitter, Input, Output } from '@angular/core';

import { IMessageView } from 'src/app/models/message/message.interface';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})

export class ChatMessageComponent {
  @Input() message: IMessageView;

  @Output() removed = new EventEmitter<IMessageView>();

  remove(): void {
    this.removed.emit(this.message);
  }
}
