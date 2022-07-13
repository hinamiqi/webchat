import { Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SecurityContext, SimpleChanges, ViewChild } from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/auth/services/auth.service';
import { IMessage } from 'src/app/models/message/message.interface';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import { DateHelperService } from 'src/app/utils/services/date-helper.service';
import { DEFAULT_MSG_ALTER_TIME_MINUTES } from 'src/app/app.config';
import { UserStatusService } from 'src/app/shared/services/user-status.service';
import { SimpleDialogComponent } from 'src/app/shared/components/simple-dialog/simple-dialog.component';
import { ChatMessage } from 'src/app/models/message/message.model';

import { ChatApiService } from '../../services/chat-api.service';
import { CommonService } from '../../services/common.service';

import { ChatMessageConfig, IChatMessageConfig } from './chat-message-config.model';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})

export class ChatMessageComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChild(SimpleDialogComponent) dialog: SimpleDialogComponent;

  @Input() config: IChatMessageConfig = new ChatMessageConfig();

  @Input() set message(val: IMessage) {
    val.text = val.text.replace(/\n/, `<br>`);
    if (val.oldText) {
      val.oldText = val.text.replace(/\n/, `<br>`);
    }
    this._message = val
  }
  get message(): IMessage {
    return this._message;
  }

  @Output() removed = new EventEmitter<IMessage>();

  editMode = false;

  imageSource: SafeResourceUrl;

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
    return this.message?.text && this.sanitizer.sanitize(SecurityContext.HTML, this.message.text);
  }

  constructor(
    public elementRef: ElementRef,
    private readonly sanitizer: DomSanitizer,
    private readonly avatarService: AvatarService,
    private readonly authService: AuthService,
    private readonly userStatusService: UserStatusService,
    private readonly chatApiService: ChatApiService,
    private readonly commonService: CommonService
  ) {}

  ngOnInit(): void {
      this.imageSource = this.sanitizer
        .bypassSecurityTrustUrl(`data:image/png;base64,${this.avatarService.getUserAvatar(this.message.author)}`);
  }

  ngOnChanges({ message }: SimpleChanges): void {
      if (message) {
        this.isCurrentUserAuthor = this.authService.isCurrentUser((<IMessage>message.currentValue).author);
        this.date = new Date(this.message.date);
      }

      if (message && !!(<IMessage>message.currentValue).oldText) {
        this.setMessageDiff(<IMessage>message.currentValue);
      }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  remove(): void {
    this.removed.emit(this.message);
  }

  edit(): void {
    this.editMode = true;
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

  submitToUser(text: string): void {
    const newDate =  new Date();
    const newMessage = new ChatMessage(
      this.authService.getCurrentUser(),
      text, newDate
    );

    this.chatApiService
      .addMessageToUser(newMessage, this.message.author.uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.dialog.close();
      });
  }

  showDiff(): void {
    if (!this.isMessageEdited) return;

    this.isDiffShow = true;
  }

  hideDiff(): void {
    this.isDiffShow = false;
  }

  openPopup() {
    if (!this.config.canSendPrivate) return;
    this.dialog.open();
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
}
