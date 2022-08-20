import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { IMeme } from 'src/app/models/file/meme.interface';
import { DbService } from 'src/app/shared/services/db.service';

import { ImageApiService } from './image-api.service';

@Injectable({providedIn: 'root'})
export class ImageService implements OnDestroy{
  cachedMemes$: Observable<Map<string, IMeme>>;

  private cachedMemes: Map<string, IMeme>;

  private _cachedMemes$ = new BehaviorSubject<Map<string, IMeme>>(null);

  private destroy$ = new Subject<void>();

  constructor(
    private readonly imageApiService: ImageApiService,
    private readonly dbService: DbService
  ) {
    this.cachedMemes = new Map();
    this.cachedMemes$ = this._cachedMemes$.asObservable();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadMeme(name: string): void {
    if (this.cachedMemes.has(name)) return;
    this.cachedMemes.set(name, null);

    this.dbService.get(name)
      .pipe(
        switchMap((response) => {
          if (!!response) {
            console.log(`Got image ${name} from Indexed DB`);
            return of(response)
          };
          return this.imageApiService.getMeme(name).pipe(tap((response) => {
            console.log(`Got image ${name} from API and saving it to Indexed DB`);
            this.saveInDb(response, name);
          }));
        })
      )
      .subscribe((response) => {
        console.log(`Set image ${name} to cache...`);
        this.cachedMemes.set(response.name, response);
        this._cachedMemes$.next(this.cachedMemes);
      });
  }

  loadAllMemes(names: string[]): void {
    names.forEach((name) => {
      this.loadMeme(name);
    });
  }

  private saveInDb(meme: IMeme, name: string): void {
    this.dbService.add(name, meme.image)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log(`Meme ${name} saved to IndexedDB.`);
      }, (err) => { console.log(err) });
  }
}
