import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

import { LocalStorageService } from 'src/app/utils/services/local-storage.service';
import { StorageTypes } from '../constants/storage-types.constant';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
    private readonly jwtHelperService = new JwtHelperService();

  constructor(private readonly localStorageService: LocalStorageService) { }

  isTokenValid(): boolean {
    const token = this.getToken();
    return !!token && !this.jwtHelperService.isTokenExpired(token);
  }

  private getToken(): string {
    return this.localStorageService.getItem(StorageTypes.TOKEN) as string;
  }
}
