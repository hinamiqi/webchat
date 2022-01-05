import { Component, OnInit } from '@angular/core';
import { StorageTypes } from '../auth/constants/storage-types.constant';
import { LocalStorageService } from '../utils/services/local-storage.service';

@Component({
  selector: 'app-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.scss']
})
export class CommonComponent implements OnInit {

  constructor(private readonly localStorageService: LocalStorageService) { }

  ngOnInit(): void {
  }

  setJwt(): void {
    this.localStorageService.setDefaultToken();
  }

  removeJwt(): void {
    this.localStorageService.removeItem(StorageTypes.TOKEN);
  }

}
