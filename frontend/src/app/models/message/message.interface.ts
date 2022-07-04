import { User } from '../auth/user.model';

export interface IMessage {
  author: User;
  text: string;
  date: Date;
  id?: number;
  oldText?: string;
  isSeparator?: boolean;
}
