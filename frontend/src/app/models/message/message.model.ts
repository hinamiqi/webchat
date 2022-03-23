import { Inject } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { AUTH_SERVICE } from 'src/app/shared/injection-tokens';
import { IMessage, IMessageView } from './message.interface';

export class ChatMessage implements IMessage {
  constructor(
    public authorName: string,
    public text: string,
    public date: Date
  ) { }
}
