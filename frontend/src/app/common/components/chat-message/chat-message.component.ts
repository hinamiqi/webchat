import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import Identicon from 'identicon.js';

import { IMessageView } from 'src/app/models/message/message.interface';

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
    private readonly sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
      let identicon = new Identicon(this.message.author.uuid, 50);

      this.imageSource = this.sanitizer.bypassSecurityTrustUrl(`data:image/png;base64,${identicon.toString()}`);
  }

  remove(): void {
    this.removed.emit(this.message);
  }
}
