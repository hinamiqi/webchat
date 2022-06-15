import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { IMessage } from 'src/app/models/message/message.interface';
import { PrivateMessageList } from 'src/app/models/message/private-message-list.interface';

@Injectable({providedIn: 'root'})
export class CommonService {
  readonly privateMessages$: Observable<PrivateMessageList>;

  private _privateMessages$ = new BehaviorSubject<PrivateMessageList>(new Map());

  constructor() {
    this.privateMessages$ = this._privateMessages$.asObservable();
  }

  pushPrivateMessage(msg: IMessage): void {
    const map = this._privateMessages$.value;
    const authorMessages = map.get(msg.author.username) || [];
    map.set(msg.author.username, [...authorMessages, msg]);
    this._privateMessages$.next(map);
  }

  getPrivateMessagesOfUser(username: string): IMessage[] {
    return this._privateMessages$.value.get(username);
  }
}
