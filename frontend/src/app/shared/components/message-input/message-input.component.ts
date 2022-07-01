import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALUE_ACCESSOR, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: MessageInputComponent,
      multi: true
    }]
})

export class MessageInputComponent implements OnInit, ControlValueAccessor {
  @Input() initialText: string;

  @Output() submitted = new EventEmitter<string>();

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
}
