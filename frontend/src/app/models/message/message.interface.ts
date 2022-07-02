import { User } from '../auth/user.model';

export interface IMessage {
  author: User;
  text: string;
  date: string;
  id?: number;
  oldText?: string;
}
