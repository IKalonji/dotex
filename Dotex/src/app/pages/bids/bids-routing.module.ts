import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BidsComponent } from './bids.component';
import { RequestComponent } from './request/request.component';

const routes: Routes = [
  { path: '', component: BidsComponent, children: [
    { path: '', component: RequestComponent, pathMatch: 'full' }
  ]}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BidsRoutingModule { }
