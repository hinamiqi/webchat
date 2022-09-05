import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';
import { IImage } from 'src/app/models/file/image.interface';

@Injectable({providedIn: 'root'})
export class UserApiService {
    private readonly backendApi = environment.backendUrl;

    constructor(
        private readonly http: HttpClient
    ) {}

    setUserAvatar(file: File): Observable<IImage> {
        const form = new FormData();
        form.append('file', file, file.name);
        return this.http.post<IImage>(`${this.backendApi}/user-profile/avatar`, form);
    }

    getUserAvatar(uuid: string): Observable<IImage> {
        let params = new HttpParams();
        params = params.append('uuid', uuid);
        return this.http.get<IImage>(`${this.backendApi}/user-profile/avatar`, { params });
    }
}