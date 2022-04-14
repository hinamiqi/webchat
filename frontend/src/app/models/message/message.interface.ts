import { User } from '../auth/user.model';

export interface IMessage {
  author: User;
  text: string;
  date: Date;
  id?: number;
}

export interface IMessageView extends IMessage {
  isCurrentUser: boolean;
}
