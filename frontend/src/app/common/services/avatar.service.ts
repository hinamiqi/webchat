import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { IImage } from 'src/app/models/file/image.interface';
import { MyIdenticon } from 'src/app/utils/services/identicon.generator';
import { UserApiService } from '../../shared/services/user-api.service';

@Injectable({providedIn: 'root'})
export class AvatarService {
  cachedAvatars$: Observable<Map<string, IImage>>;

  private cachedAvatars: Map<string, IImage>;

  private _cachedAvatars$ =  new BehaviorSubject<Map<string, IImage>>(null);

  private destroy$ = new Subject<void>();

  constructor(
    private readonly userApiService: UserApiService
  ) {
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

  private generate(hash: string): string {
    console.log('Generate new avatar from hash ', hash);
    const identicon = new MyIdenticon(hash);
    return identicon.toString();
  }
}
