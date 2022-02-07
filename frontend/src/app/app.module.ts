import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';

import { CommonComponent } from './common/common.component';

@NgModule({
  declarations: [
    AppComponent,
    CommonComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    AuthModule.forRoot(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
