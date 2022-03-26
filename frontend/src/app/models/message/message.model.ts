import { User } from '../auth/user.model';
import { IMessage } from './message.interface';

export class ChatMessage implements IMessage {
  constructor(
    public author: User,
    public text: string,
    public date: Date
  ) { }
}
