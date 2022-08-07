import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { IImage } from 'src/app/models/file/image.interface';
import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class ImageService {
  private readonly backendApi = environment.backendUrl;

  constructor(
    private readonly http: HttpClient
  ) { }

  uploadImage(file: File): Observable<IImage> {
    const uploadImageData = new FormData();
    uploadImageData.append('file', file, file.name);
    return this.http.post<IImage>(`${this.backendApi}/file/meme`, uploadImageData);
  }

  getImage(name: string): Observable<IImage> {
    let params = new HttpParams();
    params = params.append('name', name);
    return this.http.get<IImage>(`${this.backendApi}/file/meme`, { params });
  }

  getAllImages(): Observable<IImage[]> {
    return this.http.get<IImage[]>(`${this.backendApi}/file/meme/get-all`);
  }
}
