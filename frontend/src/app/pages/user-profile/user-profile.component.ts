import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

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
    const user = this.authService.getCurrentUser();
    if (!!user) {
      this.username = user.username;
      this.userRoles = user.roles.join(', ');
    }
  }
}
