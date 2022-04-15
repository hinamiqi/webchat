import { Injectable } from '@angular/core';

import { StorageTypes } from 'src/app/auth/constants/storage-types.constant';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  getItem(key: StorageTypes) {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
  }

  setItem(key: StorageTypes, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  removeItem(key: StorageTypes): void {
    localStorage.removeItem(key);
  }

  setDefaultToken(): void {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    this.setItem(StorageTypes.TOKEN, token);
  }

  setMap(key: StorageTypes, map: Map<string, any>): void {
    localStorage.setItem(key, JSON.stringify(Array.from(map.entries())));
  }

  getMap(key: StorageTypes): Map<string, any> {
    const item = localStorage.getItem(key);
    return item ? new Map(JSON.parse(item)) : null;
  }
}
