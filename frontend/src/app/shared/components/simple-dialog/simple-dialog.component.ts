import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-simple-dialog',
  templateUrl: './simple-dialog.component.html'
})

export class SimpleDialogComponent implements OnInit {
  @Input() dialogTitle: string;

  displayStyle: 'none' | 'block';

  constructor() { }

  ngOnInit(): void { }

  close(): void {
    this.displayStyle = 'none';
  }

  open(): void {
    this.displayStyle = 'block';
  }
}
