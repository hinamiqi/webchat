import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, filter } from 'rxjs/operators'

import { AuthService } from '../auth/services/auth.service';
import { WebSocketService } from '../shared/services/web-socket.service';
import { MessageService } from './services/message.service';

@Component({
  selector: 'app-common',
  templateUrl: './common.component.html',
  styleUrls: ['./common.component.scss']
})
export class CommonComponent implements OnInit, OnDestroy {

  title = 'Main page';

  userProfileRoute = '/info/profile';

  chatRoute = '/chat';

  textPlaceholder = 'Main page';

  currentUserName: string;

  get isAuth(): boolean {
    return this.authService.isAuth && !!this.currentUserName;
  }

  get isMainPage(): boolean {
    return this.router?.routerState.snapshot.url === this.chatRoute;
  }

  private destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly websocketService: WebSocketService,
    private readonly commonService: MessageService
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

    const user = this.authService.getCurrentUser();
    this.currentUserName = user.username;

    this.websocketService.connect();

    this.listenToWebSocketMessages();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.websocketService.disconnect();
  }

  logout(): void {
    this.authService.logout();
  }

  navigateTo(route: string): void {
    this.router.navigate([route], { relativeTo: this.route });
  }

  isRouteSelected(route: string): boolean {
    return this.router.routerState.snapshot.url === route;
  }

  private listenToWebSocketMessages(): void {
    this.websocketService.watchOnUserMessage()
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe((message) => {
        this.commonService.pushMainMessage(message.data);
      });

    this.websocketService.watchOnPrivateUserMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((message) => {
        this.commonService.pushPrivateMessage(message.data);
      });

    this.websocketService.watchOnUserErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe((err) => {
        console.log(`WebSocketError: `, err);
      });

    this.websocketService.watchOnGlobalEvents()
      .pipe(takeUntil(this.destroy$))
      .subscribe((event) => {
        console.log(`Recieved GLOBAL_EVENT of type ${event.type}: `, event.data);
        this.commonService.handleGlobalEvent(event);
      });
  }
}

