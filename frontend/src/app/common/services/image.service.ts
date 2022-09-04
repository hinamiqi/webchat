import { Injectable, OnDestroy } from '@angular/core';

import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { IImage } from 'src/app/models/file/image.interface';

import { IMeme } from 'src/app/models/file/meme.interface';
import { DbService } from 'src/app/shared/services/db.service';

import { ImageApiService } from './image-api.service';

@Injectable({providedIn: 'root'})
export class ImageService implements OnDestroy{
  cached$: Observable<Map<number, IImage>>;

  private cached: Map<number, IImage>;

  private _cached$ = new BehaviorSubject<Map<number, IImage>>(null);

  private destroy$ = new Subject<void>();

  private memeMap: Map<string, number>;

  constructor(
    private readonly imageApiService: ImageApiService,
    private readonly dbService: DbService
  ) {
    this.cached = new Map();
    this.cached$ = this._cached$.asObservable();
    this.memeMap = new Map();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getMemeImageId(memeName: string): number {
    return this.memeMap.get(memeName);
  }

  loadImage(id: number): void {
    if (this.cached.has(id)) return;
    /*
      This line is needed when we are loading chat messages. In that case we
      call this method for each message with embedded image inside view init
      hook. Therefore several duplicate image requests can be performed. We do
      not need several API requests, so we use that hack for now.
    */
    this.cached.set(id, null);

    this.dbService.get(id)
      .pipe(
        switchMap((response) => {
          if (!!response) {
            console.log(`Got image ${response.image.name} from Indexed DB`);
            return of(response.image)
          };
          return this.imageApiService.getImage(id).pipe(tap((response) => {
            console.log(`Got image ${response.name} from API and saving it to Indexed DB`);
            this.saveInDb(response);
          }));
        })
      )
      .subscribe((response) => {
        console.log(`Set image ${response.name} to cache...`);
        this.cached.set(response.id, response);
        this._cached$.next(this.cached);
      });
  }

  loadImages(ids: number[]): void {
    ids.forEach((id => {
      this.loadImage(id);
    }))
  }

  loadMemeMap(): void {
    this.imageApiService.getAllMemeNames()
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        Object.keys(response).forEach((key) => {
          this.memeMap.set(key, response[key]);;
        });
      });
  }

  loadAllMemes(): void {
    const ids = Array.from(this.memeMap.values());
    this.loadImages(ids);
  }

  getImage(id: number): Observable<IImage> {
    return this.cached$.pipe(
      filter((cache) => !!cache && cache.has(id) && !!cache.get(id)),
      map((cache) => cache.get(id)),
      takeUntil(this.destroy$)
    );
  }

  getMemeList(): Observable<IMeme[]> {
    const memeImageIds = Array.from(this.memeMap.values());
    return this.cached$.pipe(
      filter((cache) => memeImageIds.every((id) => cache.has(id))),
      switchMap((cache) => of(
          Array.from(this.memeMap.keys())
            .map((name) => ({ name, image: cache.get(this.memeMap.get(name)) }))
        )
      ),
      takeUntil(this.destroy$)
    );
  }

  private saveInDb(image: IImage): void {
    this.dbService.add(image.id, image)
      .pipe(takeUntil(this.destroy$))
      .subscribe((response) => {
        console.log(`Meme ${response.image.name} saved to IndexedDB.`);
      }, (err) => { console.log(err) });
  }
}
