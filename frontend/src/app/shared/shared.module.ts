import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MessageInputComponent } from './components/message-input.component';

@NgModule({
  imports: [
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    MessageInputComponent
  ],
  declarations: [
    MessageInputComponent
  ],
  providers: [],
})
export class SharedModule { }
