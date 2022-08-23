import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from 'src/environments/environment';

@Injectable({providedIn: 'root'})
export class UserProfileService {
    private readonly backendApi = environment.backendUrl;

    constructor(
        private readonly http: HttpClient
    ) {}

    setUserAvatar(file: File): Observable<File> {
        const form = new FormData();
        form.append('file', file, file.name);
        return this.http.post<File>(`${this.backendApi}/user-profile/set-avatar`, form);
    }
}