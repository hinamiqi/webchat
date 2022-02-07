import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private readonly authService: AuthService
  ) {}

  intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    const token = this.authService.getToken();
    if (!token) {
      return next.handle(req);
    }

    const tokenReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      },
    });
    return next.handle(tokenReq);
  }
}
