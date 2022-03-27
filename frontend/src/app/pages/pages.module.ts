import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InfoPageComponent } from './info-page/info-page.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: InfoPageComponent },
    { path: 'profile', component: UserProfileComponent }
  ])],
  exports: [RouterModule],
})
export class PagesRoutingModule {}

@NgModule({
  imports: [
    CommonModule,
    PagesRoutingModule,
    SharedModule
  ],
  exports: [],
  declarations: [
    InfoPageComponent,
    UserProfileComponent
  ],
  providers: [],
})
export class PagesModule { }
