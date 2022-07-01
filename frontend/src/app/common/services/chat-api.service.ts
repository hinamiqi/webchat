import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IMessage } from 'src/app/models/message/message.interface';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class ChatApiService {
  private readonly backendApi = environment.backendUrl;

  constructor(
    private readonly http: HttpClient
  ) {}

  addMessage(message: IMessage): Observable<IMessage> {
    return this.http.post<IMessage>(`${this.backendApi}/chat`, message);
  }

  addMessageToUser(message: IMessage, userId: string): Observable<IMessage> {
    return this.http.post<IMessage>(`${this.backendApi}/chat/private/${userId}`, message);
  }

  removeMessage(id: number): Observable<IMessage> {
    return this.http.delete<IMessage>(`${this.backendApi}/chat/${id}`);
  }

  editMessage(message: IMessage): Observable<IMessage> {
    return this.http.post<IMessage>(`${this.backendApi}/chat/${message.id}`, message);
  }

  getLastMessages(): Observable<IMessage[]> {
    return this.http.get<IMessage[]>(`${this.backendApi}/chat?page=0&size=10&sort=date,desc`);
  }
}
