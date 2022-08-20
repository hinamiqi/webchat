import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { NgxIndexedDBModule } from 'ngx-indexed-db';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';

import { CommonComponent } from './common/common.component';
import { ChatMessageComponent } from './common/components/chat-message/chat-message.component';
import { MainChatComponent } from './common/components/main-chat/main-chat.component';
import { SharedModule } from './shared/shared.module';
import { imageDbConfig } from './shared/constants/db.config';

@NgModule({
  declarations: [
    AppComponent,
    CommonComponent,
    MainChatComponent,
    ChatMessageComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule.forRoot(),
    SharedModule,
    NgxIndexedDBModule.forRoot(imageDbConfig),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
