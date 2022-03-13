import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

import { IServerData } from 'src/app/models/server-data.interface';
import { StaticPageApiService } from '../static-page-api.service';

@Component({
  selector: 'app-info-page',
  templateUrl: './info-page.component.html',
  styleUrls: ['./info-page.component.scss']
})

export class InfoPageComponent implements OnInit, OnDestroy {
  serverData: IServerData;

  isDataLoading = false;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly http: HttpClient,
    private readonly staticPageService: StaticPageApiService
  ) { }

  ngOnInit() {
    this.isDataLoading = true;
    this.staticPageService.getStaticPageContent("info")
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDataLoading = false;
        })
      )
      .subscribe((response) => {
        this.serverData = response;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
