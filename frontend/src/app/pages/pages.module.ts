import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InfoPageComponent } from './info-page/info-page.component';
import { HttpClientModule } from '@angular/common/http';

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
    PagesRoutingModule,
    HttpClientModule
  ],
  exports: [],
  declarations: [
    InfoPageComponent
  ],
  providers: [],
})
export class PagesModule { }
