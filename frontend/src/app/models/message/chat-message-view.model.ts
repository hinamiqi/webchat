import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

import { IMessageView } from './message.interface';
import { ChatMessage } from './message.model';

export class ChatMessageView extends ChatMessage implements IMessageView {
  constructor(chatMessage: ChatMessage, public isCurrentUser = false) {
    super(chatMessage.author, chatMessage.text, chatMessage.date, chatMessage.id);
  }
}
