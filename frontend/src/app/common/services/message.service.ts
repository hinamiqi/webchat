import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/models/auth/user.model';

import { IMessage, IRepliedMessage } from 'src/app/models/message/message.interface';
import { MessageList } from 'src/app/models/message/private-message-list.interface';
import { GlobalEventWebSocketType, IGlobalEvent } from 'src/app/models/websocket/global-event.interface';
import { MAX_REPLY_MESSAGES, MESSAGE_TO_REPLY_PREVIEW_LENGTH } from 'src/app/shared/constants/settings.const';
import { ELLIPSIS } from 'src/app/shared/constants/string.const';
import { UserStatusService } from 'src/app/shared/services/user-status.service';
import { DateHelperService } from 'src/app/utils/services/date-helper.service';
import { ChatApiService } from './chat-api.service';

export interface IChat {
  chatName: string;
  isPrivate: boolean;
  userUuid?: string;
}

const DEAFAULT_MAIN_CHAT: IChat = {
  chatName: 'Main',
  isPrivate: false,
};

@Injectable({providedIn: 'root'})
export class MessageService {
  get messageToReply(): IRepliedMessage[] {
    return this._messageToReply;
  }

  get chatList(): IChat[] {
    return this._chatList;
  }

  get currentChat(): IChat {
    return this._chatList[this.activeChat];
  }

  private activeChat: number;

  readonly messages$: Observable<IMessage[]>;

  readonly newMessages$: Observable<Map<string, number>>;

  readonly scrollQueue$: Observable<number[]>;

  private _messages$ = new BehaviorSubject<IMessage[]>([]);

  private _newMessages$ = new BehaviorSubject<Map<string, number>>(new Map());

  private _scrollQueue$ = new BehaviorSubject<number[]>(null);

  private _messageToReply: IRepliedMessage[] = [];

  private destroy$ = new Subject<void>();

  private _chatList: IChat[] = [
    DEAFAULT_MAIN_CHAT,
  ];

  constructor(
    private readonly userStatusService: UserStatusService,
    private readonly chatApiService: ChatApiService,
    private readonly authService: AuthService
  ) {
    this.messages$ = this._messages$.asObservable();
    this.newMessages$ = this._newMessages$.asObservable();
    this.scrollQueue$ = this._scrollQueue$.asObservable();
  }

  isActiveChat(index: number): boolean {
    return this.activeChat === index;
  }

  changeChat(index: number): void {
    this.activeChat = index;
    const request$ = this.currentChat.isPrivate
     ? this.chatApiService.getLastMessages(this.currentChat.userUuid, this.authService.getCurrentUser().uuid)
     : this.chatApiService.getLastMessages(null, null)

     request$
      .pipe(
        switchMap((response) => of(response.reverse())),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.pushLastMessages(response);
      });
  }

  activatePrivateChat(user: User): void {
    const existingPrivateChatIndex = this._chatList.findIndex((c) => c.userUuid === user.uuid);
    if (existingPrivateChatIndex !== -1) {
      this.changeChat(existingPrivateChatIndex);
      return;
    }
    this._chatList.push({
      chatName: user.username,
      isPrivate: true,
      userUuid: user.uuid
    });
    this.changeChat(this._chatList.length - 1);
  }

  pushPrivateMessage(msg: IMessage): void {
    if (this.currentChat.userUuid === msg.author.uuid && this.currentChat.isPrivate) {
      const map = this._messages$.value;
      // const author = msg.author.username;
      // const authorMessages = map.get(author) || [];
      this.pushNewMessages([...map, msg]);
    }
  }

  pushMainMessage(msg: IMessage): void {
    if (!this.currentChat.isPrivate && msg.receiver === null) {
      const map = this._messages$.value;
      // const mainMessages = map.get(null) || [];
      this.pushNewMessages([...map, msg]);
    }
  }

  pushLastMessages(messages: IMessage[]): void {
    this.pushNewMessages(messages);
  }

  getMessages(): Observable<IMessage[]> {
    return this.messages$
      .pipe(switchMap((messageList) => of(this.getMessagesView(messageList))))
  }

  handleGlobalEvent(event: IGlobalEvent): void {
    switch (event.type) {
      case GlobalEventWebSocketType.MESSAGE_DELETED:
        this.removeMainMessage(<number>event.data);
        break;
      case GlobalEventWebSocketType.USER_ACTIVITY:
        if (!!(<User>event.data).uuid) {
          this.userStatusService.userActivity(event.data);
        }
        break;
      case GlobalEventWebSocketType.MESSAGE_EDITED:
        this.editMainMessage(<IMessage>event.data);
        break;
      default:
        break;
    }
  }

  addMessageToReply(message: IMessage): void {
    const isInReplyAlready = this._messageToReply.find((m) => m.id === message.id);
    if (isInReplyAlready || this._messageToReply.length >= MAX_REPLY_MESSAGES) return;
    const preview = message.text.length < MESSAGE_TO_REPLY_PREVIEW_LENGTH
      ? message.text
      : message.text.substring(0, MESSAGE_TO_REPLY_PREVIEW_LENGTH - 1) + ELLIPSIS;
    this._messageToReply.push({ id: message.id, preview });
  }

  removeMessageFromReply(message: IRepliedMessage): void {
    this._messageToReply = this._messageToReply.filter((m) => m.id !== message.id);
  }

  clearMessageToReply(): void {
    this._messageToReply = [];
  }

  scrollToMessage(toMessageId: number, fromMessageId: number): void {
    let queue = this._scrollQueue$.value;
    if (!queue) queue = [];
    queue.push(fromMessageId);
    queue.push(toMessageId);
    this._scrollQueue$.next(queue);
  }

  goToPrevMessage(): void {
    let queue = this._scrollQueue$.value;
    queue.pop();
    this._scrollQueue$.next(queue);
    queue.pop();
  }

  private pushNewMessages(messages: IMessage[]): void {
    // const map = this._messages$.value;
    // map.set(null, messages);
    this._messages$.next(messages);

    const counts = this._newMessages$.value;
    // const newCount = count
    //   ? ( counts.get(chatKey) || 0) + 1
    //   : 0;
    // counts.set(chatKey, newCount);
    // messages.forEach((message) => {
    //   const prevCount = counts.get(message.author.uuid) || 0;
    //   counts.set(message.author.uuid, prevCount + 1);
    // });
    // this._newMessages$.next(counts);
  }

  private removeMainMessage(messageId: number): void {
    const currentMessages = this._messages$.value;
    const newMessages = currentMessages.filter((m) => m.id !== messageId);
    this._messages$.next(newMessages);
  }

  private editMainMessage(message: IMessage) {
    const currentMessages = this._messages$.value;
    const oldMessage = currentMessages.find((m) => m.id === message.id);

    if (!oldMessage) return;

    oldMessage.text = message.text;
    oldMessage.oldText = message.oldText;
    this._messages$.next(currentMessages);
  }

  private getMessagesView(messages: IMessage[]): IMessage[] {
    if (!messages || !messages.length) return messages;

    const view: IMessage[] = [];

    let prevDate = new Date(messages[0].date);
    for (let msg of messages) {
      const msgDate = new Date(msg.date);
      if (!DateHelperService.isSameDate(msgDate, prevDate)) {
        const separator = Object.assign({}, msg);
        separator.date = msgDate;
        separator.isSeparator = true;
        view.push(separator);
      }
      prevDate =  new Date(msg.date);
      view.push(msg);
    }
    return view;
  }
}
