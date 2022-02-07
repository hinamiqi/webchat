import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InfoPageComponent } from './info-page/info-page.component';

@NgModule({
  imports: [RouterModule.forChild([
    { path: '', component: InfoPageComponent }
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
