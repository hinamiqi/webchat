import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators'

import { StorageTypes } from '../auth/constants/storage-types.constant';
import { AuthService } from '../auth/services/auth.service';
import { LocalStorageService } from '../utils/services/local-storage.service';
import { CommonService } from './services/common.service';

@Component({
  selector: 'app-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.scss']
})
export class CommonComponent implements OnInit {

  title = 'Main page';

  menuItems = [
    { name: 'Info', route: '/info' },
  ];

  textPlaceholder = "Main page";

  currentUserName: string;

  get isAuth(): boolean {
    return this.authService.isAuth && !!this.currentUserName;
  }

  get isMainPage(): boolean {
    return this.router?.routerState.snapshot.url === "/";
  }

  private destroy$ = new Subject<void>();

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly commonService: CommonService
    ) { }

  ngOnInit(): void {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event) => {
        console.info("Navigation ended on common.component:", event);
      });

    this.currentUserName = this.localStorageService.getItem(StorageTypes.USERNAME) as string;

    this.commonService.getAllRequest()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log(response);
      });
  }


  logout(): void {
    this.authService.logout();
    this.navigateTo("/login");
  }

  navigateTo(route: string): void {
    this.router.navigate([route], { relativeTo: this.route });
  }

  isRouteSelected(route: string): boolean {
    return this.router.routerState.snapshot.url === route;
  }
}

