import { Injectable } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';

import { BehaviorSubject, Observable, Subject } from 'rxjs';

import Identicon from 'identicon.js';

import { User } from 'src/app/models/auth/user.model';
import { LocalStorageService } from 'src/app/utils/services/local-storage.service';
import { StorageTypes } from 'src/app/auth/constants/storage-types.constant';
import { IImage } from 'src/app/models/file/image.interface';
import { UserApiService } from '../../shared/services/user-api.service';
import { takeUntil } from 'rxjs/operators';

const DEFAULT_AVATAR_SIZE = 50;

@Injectable({providedIn: 'root'})
export class AvatarService {
  cachedAvatars$: Observable<Map<string, IImage>>;

  private cachedAvatars: Map<string, IImage>;

  private _cachedAvatars$ =  new BehaviorSubject<Map<string, IImage>>(null);

  private destroy$ = new Subject<void>();

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly userApiService: UserApiService
  ) {
    // this.avatars = this.localStorageService.getMap(StorageTypes.AVATARS) as Map<string, string> || new Map<string, string>();
    this.cachedAvatars$ = this._cachedAvatars$.asObservable();
    this.cachedAvatars = new Map();
  }

  loadAvatar(uuid: string): void {
    if (this.cachedAvatars.has(uuid)) return;
    this.cachedAvatars.set(uuid, null);

    this.userApiService.getUserAvatar(uuid)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        if (response.id) {
          this.cachedAvatars.set(uuid, response);
        } else {
          const newAvatar = {
            picByte: this.generate(uuid),
            id: null,
            name: `generated_avatar_${uuid}`
          };
          this.cachedAvatars.set(uuid, newAvatar);
        }
        this._cachedAvatars$.next(this.cachedAvatars);
      });
  }

  // getUserAvatar(user: User): SafeResourceUrl {
  //   const avatar = this.avatars.get(user.uuid);

  //   if (!avatar) {
  //     const newAvatar = this.generate(user.uuid);
  //     this.avatars.set(user.uuid, newAvatar);
  //     this.localStorageService.setMap(StorageTypes.AVATARS, this.avatars);
  //     return newAvatar;
  //   }

  //   return avatar;
  // }

  private generate(hash: string): string {
    console.log('Generate new avatar from hash ', hash);
    let identicon = new Identicon(hash, DEFAULT_AVATAR_SIZE);
    return identicon.toString();
  }
}
