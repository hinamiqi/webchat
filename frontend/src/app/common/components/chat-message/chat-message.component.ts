import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth/services/auth.service';
import { IMessage } from 'src/app/models/message/message.interface';

import { AvatarService } from 'src/app/shared/services/avatar.service';
import { DateHelperService } from 'src/app/utils/services/date-helper.service';

import { DEFAULT_MSG_REMOVE_TIME_MINUTES, DEFAULT_MSG_EDIT_TIME_MINUTES } from 'src/app/app.config';
import { UserStatusService } from 'src/app/shared/services/user-status.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})

export class ChatMessageComponent implements OnInit, OnChanges {
  @Input() message: IMessage;

  @Output() removed = new EventEmitter<IMessage>();

  editMode = false;

  imageSource: SafeResourceUrl;

  isCurrentUserAuthor = false;

  private date: Date;

  get canRemove(): boolean {
    return this.date > DateHelperService.getDateMinusMinutes(new Date(), DEFAULT_MSG_REMOVE_TIME_MINUTES);
  }

  get canEdit(): boolean {
    return this.date > DateHelperService.getDateMinusMinutes(new Date(), DEFAULT_MSG_EDIT_TIME_MINUTES);
  }

  get isOnline(): boolean {
    return this.userStatusService.isUserOnline(this.message.author);
  }

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly avatarService: AvatarService,
    private readonly authService: AuthService,
    private readonly userStatusService: UserStatusService
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
  }

  remove(): void {
    this.removed.emit(this.message);
  }

  edit(): void {
    this.editMode = true;
  }

  submit(message: string): void {
    this.editMode = false;
    this.message.text = message;
  }
}
