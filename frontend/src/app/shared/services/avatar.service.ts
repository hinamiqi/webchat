import { Injectable } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import Identicon from 'identicon.js';

import { User } from 'src/app/models/auth/user.model';
import { LocalStorageService } from 'src/app/utils/services/local-storage.service';
import { StorageTypes } from 'src/app/auth/constants/storage-types.constant';

const DEFAULT_AVATAR_SIZE = 50;

@Injectable({providedIn: 'root'})
export class AvatarService {
  avatars: Map<string, string>;

  constructor(
    private readonly localStorageService: LocalStorageService
  ) {
    this.avatars = this.localStorageService.getMap(StorageTypes.AVATARS) as Map<string, string> || new Map<string, string>();
  }

  getUserAvatar(user: User): SafeResourceUrl {
    const avatar = this.avatars.get(user.uuid);

    if (!avatar) {
      const newAvatar = this.generate(user.uuid);
      this.avatars.set(user.uuid, newAvatar);
      this.localStorageService.setMap(StorageTypes.AVATARS, this.avatars);
      return newAvatar;
    }

    return avatar;
  }

  private generate(hash: string): string {
    console.log('Generate new avatar from hash ', hash);
    let identicon = new Identicon(hash, DEFAULT_AVATAR_SIZE);
    return identicon.toString();
  }
}
