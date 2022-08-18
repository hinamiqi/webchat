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

  uploadImage(file: File): Observable<IImage> {
    const uploadImageData = new FormData();
    uploadImageData.append('file', file, file.name);
    return this.http.post<IImage>(`${this.backendApi}/file/image`, uploadImageData);
  }

  uploadMeme(file: File, name: string): Observable<IMeme> {
    const form = new FormData();
    form.append('file', file, name);
    return this.http.post<IMeme>(`${this.backendApi}/file/meme`, form);
  }

  getImage(name: string): Observable<IImage> {
    let params = new HttpParams();
    params = params.append('name', name);
    return this.http.get<IImage>(`${this.backendApi}/file/image`, { params });
  }

  getAllImages(): Observable<IImage[]> {
    return this.http.get<IImage[]>(`${this.backendApi}/file/image/get-all`);
  }

  getAllMemes(): Observable<IMeme[]> {
    return this.http.get<IMeme[]>(`${this.backendApi}/file/meme/get-all`);
  }

  getMeme(name: string): Observable<IMeme> {
    let params = new HttpParams();
    params = params.append('name', name);
    return this.http.get<IMeme>(`${this.backendApi}/file/meme`, { params });
  }
}
