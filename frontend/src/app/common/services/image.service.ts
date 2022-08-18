import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IMeme } from 'src/app/models/file/meme.interface';
import { ImageApiService } from './image-api.service';

@Injectable({providedIn: 'root'})
export class ImageService {

  private cachedMemes: Map<string, IMeme>;

  constructor(
    private readonly imageApiService: ImageApiService
  ) {
    this.cachedMemes = new Map();
  }

  getMeme(name: string): Observable<IMeme> {
    if (this.cachedMemes.has(name)) {
      return of(this.cachedMemes.get(name));
    }
    return this.imageApiService
      .getMeme(name)
      .pipe(
        tap((response) => {
          this.cachedMemes.set(response.name, response);
        })
      );
  }
}
