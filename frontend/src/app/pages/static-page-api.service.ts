import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

import { IServerData } from '../models/server-data.interface';

@Injectable({providedIn: 'root'})
export class StaticPageApiService {
  private readonly backendApi = environment.backendUrl;

  constructor(
    private readonly http: HttpClient
  ) { }

  getStaticPageContent(pageId: string): Observable<IServerData> {
    return this.http.get<IServerData>(`${this.backendApi}/main/${pageId}-page`);
  }
}
