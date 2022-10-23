import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'src/app/models/auth/user.model';
import { IMessage, IRepliedMessage } from 'src/app/models/message/message.interface';
import { GlobalEventWebSocketType, IGlobalEvent } from 'src/app/models/websocket/global-event.interface';
import { MAX_REPLY_MESSAGES, MESSAGE_TO_REPLY_PREVIEW_LENGTH } from 'src/app/shared/constants/settings.const';
import { ELLIPSIS } from 'src/app/shared/constants/string.const';
import { UserStatusService } from 'src/app/shared/services/user-status.service';
import { DateHelperService } from 'src/app/utils/services/date-helper.service';

import { ChatApiService } from './chat-api.service';

export interface IChat {
  id: string;
  chatName: string;
  isPrivate: boolean;
  userUuid?: string;
}

export const MAIN_CHAT_ID = 'main';

const DEAFAULT_MAIN_CHAT: IChat = {
  id: MAIN_CHAT_ID,
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
    return this._chatList[this._activeChatIndex];
  }

  get activeChatIndex(): number {
    return this._activeChatIndex;
  }

  private _activeChatIndex: number;

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

  static getPreview(message: IMessage): string {
    return message.text.length < MESSAGE_TO_REPLY_PREVIEW_LENGTH
      ? message.text
      : message.text.substring(0, MESSAGE_TO_REPLY_PREVIEW_LENGTH - 1) + ELLIPSIS;
  }

  isActiveChat(index: number): boolean {
    return this._activeChatIndex === index;
  }

  loadChatList(chats: IChat[]): void {
    this._chatList = this._chatList.concat(chats);
  }

  changeChat(index: number): void {
    this._activeChatIndex = index;
    this.fetchMessagesFromServer();
    this.clearNewMessageCounter(this.currentChat.id);
  }

  fetchMessagesFromServer(size = undefined): void {
    const request$ = this.currentChat.isPrivate
    ? this.chatApiService.getLastMessages(this.currentChat.userUuid, this.authService.getCurrentUser().uuid, size)
    : this.chatApiService.getLastMessages(null, null, size)

    request$
      .pipe(
        switchMap((response) => of(response.reverse())),
        takeUntil(this.destroy$)
      )
      .subscribe((response) => {
        this.pushLastMessages(response);
      });
  }

  /**
   * @param chatId -- ID of chat to close
   * @return flag, indicatiding that we previously active chat was closed (and,
   *   therefore, new chat will be opened)
  */
  closeChat(chatId: string): boolean {
    const prevChatId = this.currentChat.id;
    this._chatList = this._chatList.filter((c) => c.id !== chatId);
    const prevChatIndex = this._chatList.findIndex((c) => c.id === prevChatId);
    if (prevChatIndex !== -1) {
      this.changeChat(prevChatIndex);
    } else {
      this.changeChat(0);
    }

    return prevChatId !== this.currentChat.id;
  }

  activatePrivateChat(user: User, needChangeChat = true): IChat {
    const existingPrivateChatIndex = this._chatList.findIndex((c) => c.userUuid === user.uuid);
    if (existingPrivateChatIndex !== -1) {
      this.changeChat(existingPrivateChatIndex);
      return this._chatList[existingPrivateChatIndex];
    }
    this._chatList.push({
      id: user.uuid,
      chatName: user.username,
      isPrivate: true,
      userUuid: user.uuid
    });
    if (needChangeChat) {
      this.changeChat(this._chatList.length - 1);
    }
    return this._chatList[this._chatList.length - 1];
  }

  pushPrivateMessage(msg: IMessage): void {
    if (this.currentChat.isPrivate &&
        (
          this.currentChat.userUuid === msg.author.uuid ||
          this.currentChat.userUuid === msg.receiver.uuid
        )
    ) {
      const map = this._messages$.value;
      this.pushNewMessages([...map, msg]);
      this.updateNewMessageCounters(this.currentChat.id, 1);
      return;
    }
    let inactiveChat = this._chatList.find((c) => c.userUuid === msg.author.uuid);
    if (!inactiveChat) {
      inactiveChat = this.activatePrivateChat(msg.author, false);
    }
    if (!!inactiveChat) {
      this.updateNewMessageCounters(inactiveChat.id, 1);
    }
  }

  pushMainMessage(msg: IMessage): void {
    if (!this.currentChat.isPrivate && msg.receiver === null) {
      const map = this._messages$.value;
      this.pushNewMessages([...map, msg]);
      this.updateNewMessageCounters(this.currentChat.id, 1);
      return;
    }
    const mainChat = this._chatList.find((c) => !c.userUuid && !c.isPrivate);
    this.updateNewMessageCounters(mainChat.id, 1);
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
    const preview = MessageService.getPreview(message);
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

  clearNewMessageCounter(chatId: string): void {
    const counts = this._newMessages$.value;
    counts.set(chatId, 0);
    this._newMessages$.next(counts);
  }

  private pushNewMessages(messages: IMessage[]): void {
    this._messages$.next(messages);
  }

  private updateNewMessageCounters(chatId: string, count: number): void {
    const counts = this._newMessages$.value;
    const currentCount = counts.get(chatId) || 0;
    counts.set(chatId, currentCount + count);
    this._newMessages$.next(counts);
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
