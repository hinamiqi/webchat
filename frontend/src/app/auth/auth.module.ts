import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { LoginComponent } from './login/login.component';
import { SharedModule } from '../shared/shared.module';
import { TokenInterceptor } from './services/token.interceptor';
import { AuthService } from './services/auth.service';
import { AuthGuardService } from './services/auth-guard.service';

// @NgModule({
//   imports: [RouterModule.forChild([{ path: '', component: LoginComponent }])],
//   exports: [RouterModule],
// })
// export class AuthRoutingModule {}

// @NgModule({
//   declarations: [
//     LoginComponent
//   ],
//   imports: [
//     CommonModule,
//     SharedModule,
//     AuthRoutingModule
//   ],
//   // providers: [
//   //   {
//   //     provide: HTTP_INTERCEPTORS,
//   //     useClass: TokenInterceptor,
//   //     multi: true
//   //   }
//   // ]
// })
// export class AuthModule { }

@NgModule({
  imports: [CommonModule, SharedModule],
  declarations: [LoginComponent],
})
export class AuthModule {
  static forRoot(): ModuleWithProviders<RootAuthModule> {
    return {
      ngModule: RootAuthModule,
      providers: [
        AuthService,
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
  providers: [AuthService, AuthGuardService],
})
export class RootAuthModule {}
