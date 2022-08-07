import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MessageInputComponent,
      multi: true
    }]
})

export class MessageInputComponent implements OnInit, ControlValueAccessor {
  @Input() initialText: string;

  @Input() canAddImage: boolean;

  @Input() showCancelBtn: boolean;

  @Output() submitted = new EventEmitter<string>();

  @Output() addImageEvent = new EventEmitter<void>();

  @Output() cancelEvent = new EventEmitter<void>();

  form: UntypedFormGroup;

  private _value: string;

  set value(val: string) {
    this._value = val;
    this.onChange(val);
    this.onTouch(val);
    this.messageControl.setValue(val);
  }

  get value(): string {
    return this._value;
  }

  get messageControl(): AbstractControl {
    return this.form?.get('message');
  }

  constructor(
    private readonly fb: UntypedFormBuilder
  ) {}

  onChange: any = () => {}

  onTouch: any = () => {}

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(onTouched: Function): void {
    this.onTouch = onTouched;
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      message: [null, Validators.required]
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

  addImage(): void {
    this.addImageEvent.emit();
  }

  cancel(): void {
    this.cancelEvent.emit();
  }
}
