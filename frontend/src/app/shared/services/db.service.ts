import { Injectable } from '@angular/core';

import { NgxIndexedDBService } from 'ngx-indexed-db';
import { Observable } from 'rxjs';
import { IImage } from 'src/app/models/file/image.interface';

@Injectable({providedIn: 'root'})
export class DbService {
  constructor(
    private readonly dbService: NgxIndexedDBService
  ) { }

  add(id: number, image: IImage): Observable<{ id: number, image: IImage }> {
    return this.dbService.add('images', { id, image });
  }

  get(id: number): Observable<{id: number, image: IImage}> {
    return this.dbService.getByIndex('images', 'id', id);
  }

  count(id: number): Observable<number> {
    return this.dbService.countByIndex('images', 'id', id);
  }
}
