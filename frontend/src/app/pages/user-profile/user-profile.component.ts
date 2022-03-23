import { Component, OnInit } from '@angular/core';

import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: 'user-profile.component.html',
  styleUrls: ['user-profile.component.scss']
})

export class UserProfileComponent implements OnInit {
  username: string;

  // FIXME: Add privileges to local storage
  userRoles: string[];

  constructor(
    private readonly authService: AuthService
  ) { }

  ngOnInit() {
    this.username = this.authService.getCurrentUserLogin();
  }
}
