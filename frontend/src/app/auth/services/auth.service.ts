import { Injectable, OnDestroy } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Subject } from 'rxjs';

import { User } from 'src/app/models/auth/user.model';
import { LocalStorageService } from 'src/app/utils/services/local-storage.service';

import { StorageTypes } from '../constants/storage-types.constant';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  get isAuth(): boolean {
    return this.isTokenValid();
  }

  private destroy$ = new Subject<void>();

  private readonly jwtHelperService = new JwtHelperService();

  constructor(
    private readonly localStorageService: LocalStorageService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  login(user: User): void {
    this.setToken(user.token);
    this.setUser(user);
  }

  logout(): void {
    this.localStorageService.removeItem(StorageTypes.TOKEN);
    this.localStorageService.removeItem(StorageTypes.USERNAME);
    this.localStorageService.removeItem(StorageTypes.USER_ROLES);
  }

  getToken(): string {
    return this.localStorageService.getItem(StorageTypes.TOKEN) as string;
  }

  getCurrentUserLogin(): string {
    return this.localStorageService.getItem(StorageTypes.USERNAME) as string;
  }

  getCurrentUser(): User {
    return this.localStorageService.getItem(StorageTypes.CURRENT_USER) as User;
  }

  isCurrentUserLogin(login: string): boolean {
    return this.getCurrentUserLogin() === login;
  }

  private isTokenValid(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelperService.isTokenExpired(token);
  }

  private setToken(token: string): void {
    this.localStorageService.setItem(StorageTypes.TOKEN, token);
  }

  private setUser(user: User): void {
    this.localStorageService.setItem(StorageTypes.USERNAME, user.username);
    this.localStorageService.setItem(StorageTypes.CURRENT_USER, user);
  }
}
