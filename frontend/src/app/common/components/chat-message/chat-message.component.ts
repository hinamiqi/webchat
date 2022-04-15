import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { IMessageView } from 'src/app/models/message/message.interface';
import { AvatarService } from 'src/app/shared/services/avatar.service';

@Component({
  selector: 'app-chat-message',
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss']
})

export class ChatMessageComponent implements OnInit {
  @Input() message: IMessageView;

  @Output() removed = new EventEmitter<IMessageView>();

  imageSource: SafeResourceUrl;

  constructor(
    private readonly sanitizer: DomSanitizer,
    private readonly avatarService: AvatarService
  ) {}

  ngOnInit(): void {
      this.imageSource = this.sanitizer
        .bypassSecurityTrustUrl(`data:image/png;base64,${this.avatarService.getUserAvatar(this.message.author)}`);
  }

  remove(): void {
    this.removed.emit(this.message);
  }
}
