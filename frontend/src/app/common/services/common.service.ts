import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class CommonService {
  private readonly backendApi = environment.backendUrl;

  constructor(
    private readonly http: HttpClient
  ) {}

  getAllRequest(): Observable<string> {
    return this.http.get<string>(`${this.backendApi}/main/all`);
  }
}
