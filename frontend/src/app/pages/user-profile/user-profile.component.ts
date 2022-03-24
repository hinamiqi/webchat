import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: 'user-profile.component.html',
  styleUrls: ['user-profile.component.scss']
})

export class UserProfileComponent implements OnInit {
  username: string;

  userRoles: string;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly authService: AuthService
  ) { }

  ngOnInit() {
    this.authService.currentUser$
      .pipe(
        filter((user) => !!user),
        takeUntil(this.destroy$)
      )
      .subscribe((user) => {
        this.username = user.username;
        this.userRoles = user.roles.join(', ');
      });
  }
}
