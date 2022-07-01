import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';

import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, Subject } from 'rxjs';
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

  @Input() message: IMessage;

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

  private destroy$ = new Subject<void>();

  get canAlterMessage(): boolean {
    return this.isCurrentUserAuthor && this.date > DateHelperService.getDateMinusMinutes(new Date(), DEFAULT_MSG_ALTER_TIME_MINUTES);
  }

  get isOnline(): boolean {
    return this.userStatusService.isUserOnline(this.message.author);
  }

  get isMessageEdited(): boolean {
    return !!this.message.oldText?.length;
  }

  constructor(
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

  submit(text: string): void {
    this.editMode = false;

    this.chatApiService.editMessage({ ...this.message, text })
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        this.message.text = response.text;
      });
  }

  submitToUser(text: string): void {
    const newMessage = new ChatMessage(
      this.authService.getCurrentUser(),
      text, new Date()
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
    let htmlText = '';

    for (let i = 0; i < message.oldText.length; i++) {
      let isSame = message.oldText.charAt(i) === message.text.charAt(i);

      if (isSame) {
          htmlText += message.oldText.charAt(i);
          continue;
      }

      if (!isSame) {
        htmlText += '<del>';
        let j = i;
        while (!isSame || j < message.oldText.length) {
          htmlText += message.oldText.charAt(j);
          isSame = message.oldText.charAt(j) === message.text.charAt(j);
          j += 1;
        }
        htmlText += '</del>';
        htmlText += '<ins>';
        for (let x = i; x <= j; x++) {
          htmlText += message.text.charAt(x);
        }
        htmlText += '</ins>';
        i = j;
      }
  }

    this.messageDiff = htmlText;
  }
}
