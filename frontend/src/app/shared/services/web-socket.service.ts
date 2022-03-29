import { Injectable } from '@angular/core';

import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';

import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class WebSocketService {
  private rxStomp = new RxStomp();

  private rxStompConfig: RxStompConfig = {
    connectHeaders: {
      login: 'guest',
      passcode: 'guest',
    },
    brokerURL: environment.websocketUrl,
    reconnectDelay: 5000,
  };

  constructor(
    private readonly authService: AuthService
  ) {
    this.rxStomp.configure(this.rxStompConfig);
  }

  connect(): void {
    this.rxStomp.activate();
  }

  disconnect(): void {
    this.rxStomp.deactivate();
  }

  watchOnMessage(): Observable<any> {
    return this.watch(`/chat/new-message`);
  }

  send(data: any): void {
    this.rxStomp.publish({ destination: `/app/message`, body: JSON.stringify(data) });
  }

  private watch(path: string): Observable<any> {
    const token = this.authService.getToken();
    return this.rxStomp.watch(path, { token }).pipe(
      map((serverMessage) => JSON.parse(serverMessage.body))
    );
  }
}
