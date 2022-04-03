import { Injectable } from '@angular/core';

import { RxStomp, RxStompConfig } from '@stomp/rx-stomp';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';
import { IMessage } from 'src/app/models/message/message.interface';
import { IWebSocketMessage } from 'src/app/models/websocket/websocket-message.interface';

import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class WebSocketService {
  private rxStomp = new RxStomp();

  private rxStompConfig: RxStompConfig = {
    brokerURL: environment.websocketUrl,
    reconnectDelay: 5000,
  };

  constructor(
    private readonly authService: AuthService
  ) {
    this.rxStomp.configure(this.rxStompConfig);
  }

  connect(): void {
    this.rxStomp.configure({
      connectHeaders: {
        token: this.authService.getToken()
      }
    });
    this.rxStomp.activate();
  }

  disconnect(): void {
    this.rxStomp.deactivate();
  }

  watchOnUserMessage(): Observable<IWebSocketMessage<IMessage>> {
    return this.watch(`/chat/new-message`);
  }

  sendUserMessage(message: IMessage): void {
    this.send<IMessage>({ data: message });
  }

  private send<T>(wsMessage: IWebSocketMessage<T>): void {
    this.rxStomp.publish({ destination: `/app/message`, body: JSON.stringify(wsMessage) });
  }

  private watch(path: string): Observable<any> {
    const token = this.authService.getToken();
    return this.rxStomp.watch(path, { token }).pipe(
      map((serverMessage) => JSON.parse(serverMessage.body))
    );
  }
}
