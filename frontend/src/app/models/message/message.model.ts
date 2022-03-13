import { IMessage } from './message.interface';

export class ChatMessage implements IMessage {
  constructor(
    public authorId: string,
    public text: string,
    public date: Date
  ) { }
}
