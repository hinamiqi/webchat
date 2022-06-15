import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IMessage } from 'src/app/models/message/message.interface';

import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class CommonService {
  readonly privateMessages$: Observable<IMessage[]>;

  private _privateMessages$ = new BehaviorSubject<IMessage[]>([]);

  constructor() {
    this.privateMessages$ = this._privateMessages$.asObservable();
  }

  pushPrivateMessage(msg: IMessage): void {
    this._privateMessages$.next([...this._privateMessages$.value, msg]);
  }
}
