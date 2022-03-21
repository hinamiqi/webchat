import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InfoPageComponent } from './info-page/info-page.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

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
    PagesRoutingModule
  ],
  exports: [],
  declarations: [
    InfoPageComponent
  ],
  providers: [],
})
export class PagesModule { }
