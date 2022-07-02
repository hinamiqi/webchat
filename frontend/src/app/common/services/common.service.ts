import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/models/auth/user.model';

import { IMessage } from 'src/app/models/message/message.interface';
import { MessageList } from 'src/app/models/message/private-message-list.interface';
import { GlobalEventWebSocketType, IGlobalEvent } from 'src/app/models/websocket/global-event.interface';
import { UserStatusService } from 'src/app/shared/services/user-status.service';
import { DateHelperService } from 'src/app/utils/services/date-helper.service';

@Injectable({providedIn: 'root'})
export class CommonService {
  readonly messages$: Observable<MessageList>;

  readonly newMessages$: Observable<Map<string, number>>;

  private _messages$ = new BehaviorSubject<MessageList>(new Map());

  private _newMessages$ = new BehaviorSubject<Map<string, number>>(new Map());

  constructor(
    private readonly userStatusService: UserStatusService,
    private readonly authService: AuthService
  ) {
    this.messages$ = this._messages$.asObservable();
    this.newMessages$ = this._newMessages$.asObservable();
  }

  pushPrivateMessage(msg: IMessage): void {
    const map = this._messages$.value;
    const author = msg.author.username;
    const authorMessages = map.get(author) || [];
    this.pushNewMessages(author, [...authorMessages, msg]);
  }

  pushMainMessage(msg: IMessage): void {
    const map = this._messages$.value;
    const mainMessages = map.get(null) || [];
    this.pushNewMessages(null, [...mainMessages, msg]);
  }

  pushLastMessages(messages: IMessage[]): void {
    this.pushNewMessages(null, messages, null);
  }

  getPrivateMessagesOfUser(username: string): Observable<IMessage[]> {
    return this.messages$
      .pipe(switchMap((map) => {
        if (map.has(username)) return of(this.getMessagesView(map.get(username)));
        return of([]);
      }));
  }

  getMainMessages(): Observable<IMessage[]> {
    return this.messages$
      .pipe(switchMap((messageList) => of(this.getMessagesView(messageList.get(null)))))
  }

  handleGlobalEvent(event: IGlobalEvent): void {
    switch (event.type) {
      case GlobalEventWebSocketType.MESSAGE_DELETED:
        this.removeMainMessage(<IMessage>event.data);
        break;
      case GlobalEventWebSocketType.USER_ACTIVITY:
        if (!!(<User>event.data).uuid) {
          this.userStatusService.userActivity(event.data);
        }
        break;
      case GlobalEventWebSocketType.MESSAGE_EDITED:
        if (!this.authService.isCurrentUser((<IMessage>event.data).author)) {
          this.editMainMessage(<IMessage>event.data);
        }
        break;
      default:
        break;
    }
  }

  private pushNewMessages(chatKey: string, messages: IMessage[], count = 1): void {
    const map = this._messages$.value;
    map.set(chatKey, messages);
    this._messages$.next(map);

    const counts = this._newMessages$.value;
    const newCount = count
      ? ( counts.get(chatKey) || 0) + 1
      : 0;
    counts.set(chatKey, newCount);
    this._newMessages$.next(counts);
  }

  private removeMainMessage(message: IMessage): void {
    const map = this._messages$.value;
    const currentMessages = map.get(null);
    const newMessages = currentMessages.filter((m) => m.id === message.id);
    map.set(null, newMessages);
    this._messages$.next(map);
  }

  private editMainMessage(message: IMessage) {
    const map = this._messages$.value;
    const currentMessages = map.get(null);
    const oldMessage = currentMessages.find((m) => m.id === message.id);

    if (!oldMessage) return;

    oldMessage.text = message.text;
    oldMessage.oldText = message.oldText;
    map.set(null, currentMessages);
    this._messages$.next(map);
  }

  private getMessagesView(messages: IMessage[]): IMessage[] {
    if (!messages || !messages.length) return messages;

    const view: IMessage[] = [];
    const today = new Date();

    let prevDate = new Date(messages[0].date);
    for (let msg of messages) {
      const msgDate = new Date(msg.date);
      if (!DateHelperService.isSameDate(msgDate, prevDate)) {
        const separator = Object.assign({}, msg);
        separator.date = msgDate.toDateString();
        separator.isSeparator = true;
        view.push(separator);
      }
      prevDate =  new Date(msg.date);
      view.push(msg);
    }
    return view;
  }
}
