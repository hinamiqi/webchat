import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuardService } from './auth/services/auth-guard.service';
import { CommonComponent } from './common/common.component';

const routes: Routes = [
    {
        path: '',
        component: CommonComponent,
        canActivate: [AuthGuardService]
    },
    {
      path: 'login',
      loadChildren: () => import('./auth/auth.module').then((m) => m.AuthModule),
    },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
