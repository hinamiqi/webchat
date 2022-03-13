import { IMessage } from './message.interface';

export class ChatMessage implements IMessage {
  constructor(
    public authorName: string,
    public text: string,
    public date: Date
  ) { }
}
