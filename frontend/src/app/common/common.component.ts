import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators'

import { AuthService } from '../auth/services/auth.service';
import { CommonService } from './services/common.service';

@Component({
  selector: 'app-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.scss']
})
export class CommonComponent implements OnInit, OnDestroy {

  title = 'Main page';

  menuItems = [
    { name: 'Info', route: '/info' },
    { name: 'User', route: '/info/profile' }
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

    this.currentUserName = this.authService.getCurrentUserLogin();

    this.commonService.getAllRequest()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log(response);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

