import { Injectable } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';
import { ChatMessageView } from 'src/app/models/message/chat-message-view.model';
import { IMessage } from 'src/app/models/message/message.interface';

@Injectable({providedIn: 'root'})
export class ChatService {
  constructor(
    private readonly authService: AuthService
  ) {}

  getChatMessageView(message: IMessage) {
      return new ChatMessageView(message, this.authService.isCurrentUserLogin(message.authorName));
  }
}
