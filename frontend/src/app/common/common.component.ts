import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterEvent } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators'

import { StorageTypes } from '../auth/constants/storage-types.constant';
import { LocalStorageService } from '../utils/services/local-storage.service';
import { LOREM_IPSUM } from './lorem-ipsum.const';

@Component({
  selector: 'app-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.scss']
})
export class CommonComponent implements OnInit {
  // get title(): string {
  //   return this.route.snapshot.url.length === 0
  //     ?
  //     : 'Another page';
  // }

  title = 'Main page';

  menuItems = [
    { name: 'Алеся', route: '/alice' },
    { name: 'Тихон', route: '/tycho' },
    { name: 'Info', route: '/info' },
  ];

  isMainPage = false;

  textPlaceholder = LOREM_IPSUM;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
    ) { }

  ngOnInit(): void {
    // console.log(this.router.url);
    // console.log(this.route.component)
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        this.afterPageLoad();

      });

    this.afterPageLoad();
  }

  setJwt(): void {
    this.localStorageService.setDefaultToken();
  }

  removeJwt(): void {
    this.localStorageService.removeItem(StorageTypes.TOKEN);
  }

  navigateTo(route: string): void {
    this.router.navigate([route], { relativeTo: this.route });
  }

  private afterPageLoad(): void {
    const url = this.router.routerState.snapshot.url;
    // this.title = url === '/' ? 'Main page' : 'Another page';
    this.isMainPage = url === '/';
  }
}

