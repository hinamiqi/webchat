import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html'
})

export class MessageInputComponent implements OnInit {
  @Input() initialText: string;

  @Output() submitted = new EventEmitter<string>();

  form: FormGroup;

  get messageControl(): AbstractControl {
    return this.form?.get('message');
  }

  constructor(
    private readonly fb: FormBuilder
  ) { }

  ngOnInit() {
    this.form = this.fb.group({
      message: [this.initialText, Validators.required]
    });
  }

  submitIfNeeded(event: KeyboardEvent): void {
    if (event.code === 'Enter' && !event.shiftKey) {
      this.submit();
    }
  }

  submit(): void {
    if (!this.messageControl.value) return;

    this.submitted.emit(<string>this.messageControl.value);
  }
}
