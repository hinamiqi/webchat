import { Injectable, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject, interval } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { AUTH_CHECK_INTERVAL_MS } from 'src/app/app.config';
import { User } from 'src/app/models/auth/user.model';
import { LocalStorageService } from 'src/app/utils/services/local-storage.service';

import { StorageTypes } from '../constants/storage-types.constant';
import { UserRoles } from '../constants/user-roles.const';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  user: User;

  get isAuth(): boolean {
    return !!this.getToken();
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
    this.user = user;
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
    if (!this.user) {
      this.user = this.localStorageService.getItem(StorageTypes.CURRENT_USER) as User;
    }
    return this.user;
  }

  isCurrentUser(user: User): boolean {
    return this.getCurrentUser().uuid === user.uuid;
  }

  checkRole(role: UserRoles): boolean {
    return this.user.roles.includes(role);
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
    interval(AUTH_CHECK_INTERVAL_MS)
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
