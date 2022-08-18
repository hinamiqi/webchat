import { User } from '../auth/user.model';

export interface IRepliedMessage {
  id: number;
  preview: string;
}

export interface IMessage {
  author: User;
  text: string;
  date: Date;
  id?: number;
  oldText?: string;
  isSeparator?: boolean;
  repliedMessages?: IRepliedMessage[];
  memeName?: string;
}
