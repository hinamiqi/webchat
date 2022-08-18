import { User } from '../auth/user.model';
import { IMessage, IRepliedMessage } from './message.interface';

export class ChatMessage implements IMessage {
  constructor(
    public author: User,
    public text: string,
    public date: Date,
    public repliedMessages: IRepliedMessage[],
    public memeName?: string
  ) { }
}
