import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { LoginComponent } from './login/login.component';
import { SharedModule } from '../shared/shared.module';
import { TokenInterceptor } from './services/token.interceptor';
import { AuthGuardService } from './services/auth-guard.service';

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [LoginComponent],
})
export class AuthModule {
  static forRoot(): ModuleWithProviders<RootAuthModule> {
    return {
      ngModule: RootAuthModule,
      providers: [
        AuthGuardService,
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true,
        }
      ],
    };
  }
}

@NgModule({
  imports: [
    AuthModule,
    RouterModule.forChild([{ path: '', component: LoginComponent }]),
  ],
  providers: [AuthGuardService],
})
export class RootAuthModule {}
