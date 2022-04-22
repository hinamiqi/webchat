import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth/services/auth.service';
import { IMessage } from 'src/app/models/message/message.interface';

import { AvatarService } from 'src/app/shared/services/avatar.service';
import { DateHelperService } from 'src/app/utils/services/date-helper.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})

export class ChatMessageComponent implements OnInit, OnChanges {
  @Input() message: IMessage;

  @Output() removed = new EventEmitter<IMessage>();

  imageSource: SafeResourceUrl;

  isCurrentUserAuthor = false;

  private date: Date;

  get canRemove(): boolean {
    return this.date > DateHelperService.getDateMinusMinutes(new Date(), 1);
  }

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly avatarService: AvatarService,
    private readonly authService: AuthService
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
}
