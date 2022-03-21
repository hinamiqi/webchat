import { Component, OnInit } from '@angular/core';
import { StorageTypes } from 'src/app/auth/constants/storage-types.constant';
import { LocalStorageService } from 'src/app/utils/services/local-storage.service';

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
    private readonly localStorageService: LocalStorageService
  ) { }

  ngOnInit() {
    this.username = this.localStorageService.getItem(StorageTypes.USERNAME);
  }
}
