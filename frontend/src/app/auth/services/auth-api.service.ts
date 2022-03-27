import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { IChangePasswordRequest } from 'src/app/models/auth/change-password-request.interface';
import { ILoginRequest } from 'src/app/models/auth/login-request.interface';
import { ILoginResponse } from 'src/app/models/auth/login-response.interface';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class AuthApiService {
  api = environment.backendUrl;

  constructor(
    private readonly http: HttpClient
  ) {}

  login(params: ILoginRequest): Observable<ILoginResponse> {
    return this.http.post<ILoginResponse>(`${this.api}/auth/login`, params);
  }

  changePassword(params: IChangePasswordRequest): Observable<boolean> {
    return this.http.post<boolean>(`${this.api}/auth/change-password`, params);
  }
}
