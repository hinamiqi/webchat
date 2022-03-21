export interface IMessage {
  authorName: string;
  text: string;
  date: Date;
}

export interface IMessageView extends IMessage {
  isCurrentUser: boolean;
}
