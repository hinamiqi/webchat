import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { ILoginRequest } from 'src/app/models/auth/login-request.interface';
import { User } from 'src/app/models/auth/user.model';
import { ErrorHandlingService } from 'src/app/shared/services/error-handling.service';

import { LocalStorageService } from 'src/app/utils/services/local-storage.service';
import { AuthApiService } from '../services/auth-api.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  form: FormGroup;

  errorMessage: string = null;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly localStorageService: LocalStorageService,
    private readonly router: Router,
    private readonly authApiService: AuthApiService,
    private readonly fb: FormBuilder,
    private readonly errService: ErrorHandlingService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    });
  }

  private setJwt(): void {
    this.localStorageService.setDefaultToken();
  }

  login(): void {
    if (this.form.invalid) return;

    this.errorMessage = null;

    this.authApiService.login(this.form.value as ILoginRequest)
      .pipe(
        takeUntil(this.destroy$),
        catchError(this.errService.handleError)
      )
      .subscribe(({ username, token }) => {
        this.authService.login(new User(username, token));
        this.router.navigate(['./']);
      },
      (errMsg) => {
        this.errorMessage = errMsg;
      });
  }

}
