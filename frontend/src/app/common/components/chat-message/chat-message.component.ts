import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SecurityContext, SimpleChanges, ViewChild } from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { filter, first, takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/auth/services/auth.service';
import { IMessage, IRepliedMessage } from 'src/app/models/message/message.interface';
import { DateHelperService } from 'src/app/utils/services/date-helper.service';
import { DEFAULT_MSG_ALTER_TIME_MINUTES } from 'src/app/app.config';
import { UserStatusService } from 'src/app/shared/services/user-status.service';
import { User } from 'src/app/models/auth/user.model';

import { ChatApiService } from '../../services/chat-api.service';
import { MessageService } from '../../services/message.service';

import { ChatMessageConfig, IChatMessageConfig } from './chat-message-config.model';
import { ImageService } from '../../services/image.service';
import { AvatarService } from '../../services/avatar.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})

export class ChatMessageComponent implements OnInit, OnDestroy {
  @Input() config: IChatMessageConfig = new ChatMessageConfig();

  @Input() set message(val: IMessage) {
    val.text = this.transformMessageText(val.text);
    if (val.oldText) {
      val.oldText = this.transformMessageText(val.oldText);
      this.setMessageDiff(val);
    }
    this.isCurrentUserAuthor = this.authService.isCurrentUser(val.author);
    this.date = new Date(val.date);
    this._message = val
  }
  get message(): IMessage {
    return this._message;
  }

  @Output() removed = new EventEmitter<IMessage>();

  @Output() openPrivateChat = new EventEmitter<User>();

  editMode = false;

  avatarImageSource: SafeResourceUrl;

  memeImageSource: SafeResourceUrl;

  isCurrentUserAuthor = false;

  isDiffShow = false;

  messageDiff: string;

  privateMessageConfig: IChatMessageConfig = {
    editable: false,
    canSendPrivate: false
  };

  private date: Date;

  private today = new Date();

  private destroy$ = new Subject<void>();

  private _message: IMessage;

  get canAlterMessage(): boolean {
    return this.isCurrentUserAuthor && this.date > DateHelperService.getDateMinusMinutes(new Date(), DEFAULT_MSG_ALTER_TIME_MINUTES);
  }

  get isOnline(): boolean {
    return this.userStatusService.isUserOnline(this.message.author);
  }

  get isMessageEdited(): boolean {
    return !!this.message.oldText?.length;
  }

  get isToday(): boolean {
    return !!this.date && DateHelperService.isSameDate(this.date, this.today);
  }

  get safeText(): string {
    return this.message?.text;
  }

  get isMeme(): boolean {
    return !!this.message.memeName;
  }

  constructor(
    public elementRef: ElementRef,
    private readonly sanitizer: DomSanitizer,
    private readonly avatarService: AvatarService,
    private readonly authService: AuthService,
    private readonly userStatusService: UserStatusService,
    private readonly chatApiService: ChatApiService,
    private readonly commonService: MessageService,
    private readonly imageService: ImageService
  ) {}

  ngOnInit(): void {
    this.avatarService.loadAvatar(this.message.author.uuid);
    this.avatarService.cachedAvatars$
      .pipe(
        filter((response) => !!response),
        filter((response) => response.has(this.message.author.uuid) && !!response.get(this.message.author.uuid)),
        takeUntil(this.destroy$)
      )
      .subscribe((cache) => {
        const avatar = cache.get(this.message.author.uuid);
        if (avatar.picByte == null) {
          this.loadAvatarFromImg(avatar.id)
            .then(() => console.log(`Load user avavar from image`))
            .catch((err) => console.log(`Error during user avatar loading: ${err}`));
        } else {
          this.avatarImageSource = this.sanitizer
            .bypassSecurityTrustUrl(`data:image/svg+xml;base64,${avatar.picByte}`);
        }
      });

    if (this.isMeme) {
      this.loadImage();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  remove(): void {
    this.removed.emit(this.message);
  }

  toggleEdit(): void {
    this.editMode = !this.editMode;
  }

  reply(): void {
    this.commonService.addMessageToReply(this._message);
  }

  submit(text: string): void {
    this.editMode = false;

    this.chatApiService.editMessage({ ...this.message, text })
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.message.text = response.text;
      });
  }

  showDiff(): void {
    if (!this.isMessageEdited) return;

    this.isDiffShow = true;
  }

  hideDiff(): void {
    this.isDiffShow = false;
  }

  emitOpenPrivateChat(): void {
    if (!this.config.canSendPrivate) return;
    this.openPrivateChat.emit(this._message.author);
  }

  scrollToMessage(toMessage: IRepliedMessage): void {
    this.commonService.scrollToMessage(toMessage.id, this._message.id);
  }

  private setMessageDiff(message: IMessage): void {
    const oldText = this.sanitizer.sanitize(SecurityContext.HTML, message.oldText);
    const text = this.sanitizer.sanitize(SecurityContext.HTML, message.text);
    let htmlText = '';

    for (let i = 0; i < oldText.length; i++) {
      let isSame = oldText.charAt(i) === text.charAt(i);

      if (isSame) {
          htmlText += oldText.charAt(i);
          continue;
      }

      if (!isSame) {
        htmlText += '<del>';
        let j = i;
        while (!isSame || j < oldText.length) {
          htmlText += oldText.charAt(j);
          isSame = oldText.charAt(j) === text.charAt(j);
          j += 1;
        }
        htmlText += '</del>';
        htmlText += '<ins>';
        for (let x = i; x <= j; x++) {
          htmlText += text.charAt(x);
        }
        htmlText += '</ins>';
        i = j;
      }
  }

    this.messageDiff = htmlText;
  }

  private loadImage(): void {
    const id = this.imageService.getMemeImageId(this.message.memeName);
    this.imageService.loadImage(id)
    this.imageService.getImage(id)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((image) => {
        this.memeImageSource = this.sanitizer.bypassSecurityTrustUrl(`data:image/png;base64,${image.picByte}`);
      });
  }

  private async loadAvatarFromImg(imageId: number): Promise<void> {
    this.imageService.loadImage(imageId);
    const image = await this.imageService.getImage(imageId).pipe(first()).toPromise();
    this.avatarImageSource = this.sanitizer
            .bypassSecurityTrustUrl(`data:image/png;base64,${image.picByte}`);
  }

  private transformMessageText(messageText: string): string {
    if (!messageText) return "";
    let transformedText = messageText.replace(/\n/, `<br>`);
    transformedText = this.sanitizer.sanitize(SecurityContext.HTML, transformedText);
    transformedText = this.transformHttpsUrlsToATags(transformedText);
    transformedText = this.transformYoutubeShortsUrlsToNormalVideoUrls(transformedText);
    return transformedText;
  }

  private transformHttpsUrlsToATags(text: string): string {
    return text.replace(/(https:\/[^\s]+)/g, `<a href="$1" target="_blank">$1</a>`);
  }

  private transformYoutubeShortsUrlsToNormalVideoUrls(text: string): string {
    return text.replace(
      /<a href="https:\/\/www\.youtube\.com\/shorts\/([0-9A-z]+)" target="_blank">[^<]+<\/a>/g,
      `<a href="https://www.youtube.com/watch?v=$1" target="_blank">~_~ no youtube shorts here! (https://www.youtube.com/watch?v=$1) </a>`
    );
  }
}
