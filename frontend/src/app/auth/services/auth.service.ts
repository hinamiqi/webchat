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
  // isAuth = new ReplaySubject<boolean>(1);
  get isAuth(): boolean {
    return this.isTokenValid();
  }

  private destroy$ = new Subject<void>();

  private readonly jwtHelperService = new JwtHelperService();

  constructor(private readonly localStorageService: LocalStorageService) {
    // this.user
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((user) => {
    //     this.setToken(user.token);
    //   });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  login(user: User): void {
    this.setToken(user.token);
    this.setUser(user);
    // this.isAuth.next(true);
  }

  logout(): void {
    this.localStorageService.removeItem(StorageTypes.TOKEN);
    this.localStorageService.removeItem(StorageTypes.USERNAME);
    this.localStorageService.removeItem(StorageTypes.PRIVILEGES_KEY);
  }

  getToken(): string {
    return this.localStorageService.getItem(StorageTypes.TOKEN) as string;
  }

  getCurrentUserLogin(): string {
    return this.localStorageService.getItem(StorageTypes.USERNAME) as string;
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
  }
}
