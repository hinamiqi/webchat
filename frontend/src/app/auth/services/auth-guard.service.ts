import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
      const isAuthed = this.authService.isTokenValid();
      if (!isAuthed) {
        this.router.navigate(['login']);
      }
      return isAuthed;
  }
}
