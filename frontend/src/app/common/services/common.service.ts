import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/models/auth/user.model';

import { IMessage } from 'src/app/models/message/message.interface';
import { PrivateMessageList } from 'src/app/models/message/private-message-list.interface';
import { GlobalEventWebSocketType, IGlobalEvent } from 'src/app/models/websocket/global-event.interface';
import { UserStatusService } from 'src/app/shared/services/user-status.service';

@Injectable({providedIn: 'root'})
export class CommonService {
  readonly privateMessages$: Observable<PrivateMessageList>;

  readonly mainChatMessages$: Observable<IMessage[]>;

  private _privateMessages$ = new BehaviorSubject<PrivateMessageList>(new Map());

  private _mainChatMessages$ = new BehaviorSubject<IMessage[]>([]);

  constructor(
    private readonly userStatusService: UserStatusService,
    private readonly authService: AuthService
  ) {
    this.privateMessages$ = this._privateMessages$.asObservable();
    this.mainChatMessages$ = this._mainChatMessages$.asObservable();
  }

  pushPrivateMessage(msg: IMessage): void {
    const map = this._privateMessages$.value;
    const authorMessages = map.get(msg.author.username) || [];
    map.set(msg.author.username, [...authorMessages, msg]);
    this._privateMessages$.next(map);
  }

  pushMainMessage(msg: IMessage): void {
    this._mainChatMessages$.next([...this._mainChatMessages$.value, msg]);
  }

  getPrivateMessagesOfUser(username: string): Observable<IMessage[]> {
    return this.privateMessages$
      .pipe(switchMap((map) => {
        if (map.has(username)) return of(map.get(username));
        return of([]);
      }));
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

  private removeMainMessage(message: IMessage): void {
    const currentMessages = this._mainChatMessages$.value;
    this._mainChatMessages$.next(currentMessages.filter((m) => m.id === message.id));
  }

  private editMainMessage(message: IMessage) {
    const currentMessages = this._mainChatMessages$.value;
    const oldMessage = currentMessages.find((m) => m.id === message.id);

    if (!oldMessage) return;

    oldMessage.text = message.text;
    oldMessage.oldText = message.oldText;
    this._mainChatMessages$.next(currentMessages);
  }
}
