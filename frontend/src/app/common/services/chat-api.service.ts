import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { IMessage } from 'src/app/models/message/message.interface';
import { environment } from 'src/environments/environment';
import { DEFAULT_CHAT_PAGE_SIZE } from 'src/app/shared/constants/settings.const';

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

  removeMessage(id: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.backendApi}/chat/${id}`);
  }

  editMessage(message: IMessage): Observable<IMessage> {
    return this.http.post<IMessage>(`${this.backendApi}/chat/${message.id}`, message);
  }

  getLastMessages(size = DEFAULT_CHAT_PAGE_SIZE, receiverUuid: string): Observable<IMessage[]> {
    let params = new HttpParams();
    params = params.append('receiverUuid', receiverUuid);
    return this.http.get<IMessage[]>(`${this.backendApi}/chat?page=0&size=${size}&sort=date,desc`, { params });
  }

  getMessageToDate(date: Date, size = DEFAULT_CHAT_PAGE_SIZE): Observable<IMessage[]> {
    return this.http.post<IMessage[]>(`${this.backendApi}/chat/to-date?page=0&size=${size}&sort=date,desc`, date);
  }

  getToMessage(messageId: number, size = DEFAULT_CHAT_PAGE_SIZE): Observable<IMessage[]> {
    return this.http.post<IMessage[]>(`${this.backendApi}/chat/to-message?page=0&size=${size}&sort=date,desc`, messageId);
  }
}
