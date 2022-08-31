import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { IImage } from 'src/app/models/file/image.interface';
import { IMeme } from 'src/app/models/file/meme.interface';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class ImageApiService {
  private readonly backendApi = environment.backendUrl;

  constructor(
    private readonly http: HttpClient
  ) { }

  uploadMeme(file: File, name: string): Observable<IMeme> {
    const form = new FormData();
    form.append('file', file, name);
    return this.http.post<IMeme>(`${this.backendApi}/file/meme`, form);
  }

  getAllMemes(): Observable<IMeme[]> {
    return this.http.get<IMeme[]>(`${this.backendApi}/file/meme/get-all`);
  }

  getAllMemeNames(): Observable<string[]> {
    return this.http.get<string[]>(`${this.backendApi}/file/meme/get-all-names`);
  }

  getMeme(name: string): Observable<IMeme> {
    let params = new HttpParams();
    params = params.append('name', name);
    return this.http.get<IMeme>(`${this.backendApi}/file/meme`, { params });
  }
}
