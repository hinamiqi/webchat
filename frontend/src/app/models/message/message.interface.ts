import { User } from '../auth/user.model';

export interface IMessage {
  author: User;
  text: string;
  date: Date;
}

export interface IMessageView extends IMessage {
  isCurrentUser: boolean;
}
