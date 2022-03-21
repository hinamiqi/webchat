import { IMessage, IMessageView } from './message.interface';

export class ChatMessage implements IMessage {
  constructor(
    public authorName: string,
    public text: string,
    public date: Date
  ) { }
}

export class ChatMessageView extends ChatMessage implements IMessageView {
  constructor(chatMessage: ChatMessage, public isCurrentUser: boolean = false) {
    super(chatMessage.authorName, chatMessage.text, chatMessage.date);
  }
}
