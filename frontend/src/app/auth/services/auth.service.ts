import { Injectable, OnDestroy } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { User } from 'src/app/models/auth/user.model';

import { LocalStorageService } from 'src/app/utils/services/local-storage.service';
import { StorageTypes } from '../constants/storage-types.constant';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  readonly currentUser$: Observable<User>;

  get isAuth(): boolean {
    return this.isTokenValid();
  }

  private destroy$ = new Subject<void>();

  private readonly jwtHelperService = new JwtHelperService();

  private _currentUser$ = new ReplaySubject<User>(1);

  constructor(
    private readonly localStorageService: LocalStorageService
  ) {
    this.currentUser$ = this._currentUser$.asObservable();
    this._currentUser$.next(new User({
      token: this.localStorageService.getItem(StorageTypes.TOKEN),
      username: this.localStorageService.getItem(StorageTypes.USERNAME),
      roles: this.localStorageService.getItem(StorageTypes.USER_ROLES),
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._currentUser$.complete();
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
    this.localStorageService.setItem(StorageTypes.USER_ROLES, user.roles);
    this._currentUser$.next(user);
  }
}
