import { Injectable } from '@angular/core';

import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { IImage } from 'src/app/models/file/image.interface';
import { IMeme } from 'src/app/models/file/meme.interface';

@Injectable({providedIn: 'root'})
export class DbService {
  constructor(
    private readonly dbService: NgxIndexedDBService
  ) { }

  add(name: string, image: IImage): Observable<IMeme> {
    return this.dbService.add('images', { name, image });
  }

  get(name: string): Observable<IMeme> {
    return this.dbService.getByIndex('images', 'name', name);
  }

  count(name: string): Observable<number> {
    return this.dbService.countByIndex('images', 'name', name);
  }
}
