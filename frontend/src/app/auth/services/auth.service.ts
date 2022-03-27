import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject, interval } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { User } from 'src/app/models/auth/user.model';
import { LocalStorageService } from 'src/app/utils/services/local-storage.service';

import { StorageTypes } from '../constants/storage-types.constant';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  get isAuth(): boolean {
    return !!this.getCurrentUser();
  }

  private destroy$ = new Subject<void>();

  private readonly jwtHelperService = new JwtHelperService();

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly router: Router
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  login(user: User): void {
    this.setToken(user.token);
    this.setUser(user);
    this.setAuthCheck();
  }

  logout(): void {
    this.localStorageService.removeItem(StorageTypes.TOKEN);
    this.localStorageService.removeItem(StorageTypes.CURRENT_USER);
    this.router.navigate(["/login"]);
  }

  getToken(): string {
    return this.localStorageService.getItem(StorageTypes.TOKEN) as string;
  }

  getCurrentUserLogin(): string {
    return this.getCurrentUser().username;
  }

  getCurrentUser(): User {
    return this.localStorageService.getItem(StorageTypes.CURRENT_USER) as User;
  }

  isCurrentUser(user: User): boolean {
    return this.getCurrentUser().uuid === user.uuid;
  }

  private isTokenValid(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelperService.isTokenExpired(token);
  }

  private setToken(token: string): void {
    this.localStorageService.setItem(StorageTypes.TOKEN, token);
  }

  private setUser(user: User): void {
    this.localStorageService.setItem(StorageTypes.CURRENT_USER, user);
  }

  private setAuthCheck(): void {
    interval(1000)
      .pipe(
        filter(() => !this.isTokenValid() && this.isAuth),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        alert('Your session has timed out. You will be redirected to the login page.');
        this.logout();
      });
  }
}
