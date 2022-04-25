import { Injectable, OnDestroy } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { USER_STATUS_EXPIRATION_MINUTES } from 'src/app/app.config';
import { User } from 'src/app/models/auth/user.model';
import { LocalStorageService } from 'src/app/utils/services/local-storage.service';

type OnlineUsers = Map<string, Date>;

@Injectable({providedIn: 'root'})
export class UserStatusService implements OnDestroy {
  private onlineUsers: OnlineUsers;

  private _schedulerSet = false;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly localStorageService: LocalStorageService
  ) {
    this.onlineUsers = this.getNewMap();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  userActivity(user: User): void {
    this.onlineUsers.set(user.uuid, new Date());
  }

  isUserOnline(user: User): boolean {
    return this.onlineUsers.has(user.uuid);
  }

  setUserStatusesExpireScheduler(): void {
    if (this._schedulerSet) return;

    this._schedulerSet = true;
    interval(1000)
      .pipe(
        filter(() => !!this.onlineUsers.size),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        const currentDate = new Date();
        const newUsers = this.getNewMap();
        this.onlineUsers.forEach((value, key) => {
          if ((currentDate.getTime() - value.getTime()) < USER_STATUS_EXPIRATION_MINUTES * 60 * 1000) {
            newUsers.set(key, value);
          }
        });
        this.onlineUsers = newUsers;
      });
  }

  private getNewMap(): OnlineUsers {
    return new Map<string, Date>();
  }
}
