import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html'
})

export class MessageInputComponent implements OnInit, OnChanges {
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

  ngOnChanges({ initialText }: SimpleChanges): void {
      if (initialText) {
        this.messageControl?.setValue(initialText.currentValue || null, { emitEvent: false });
      }
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
