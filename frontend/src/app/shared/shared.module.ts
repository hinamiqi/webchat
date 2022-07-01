import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MessageInputComponent } from './components/message-input/message-input.component';
import { SimpleDialogComponent } from './components/simple-dialog/simple-dialog.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MessageInputComponent,
    SimpleDialogComponent
  ],
  declarations: [
    MessageInputComponent,
    SimpleDialogComponent
  ],
  providers: [],
})
export class SharedModule { }
