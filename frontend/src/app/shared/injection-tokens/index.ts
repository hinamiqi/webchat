import { InjectionToken } from '@angular/core';
import { AuthService } from 'src/app/auth/services/auth.service';

export const AUTH_SERVICE = new InjectionToken<AuthService>('AUTH_SERVICE');
