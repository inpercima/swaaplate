import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../services/auth-guard.service';

import { HomeComponent } from '../../components/home/home.component';

const routes: Routes = [{
  component: HomeComponent,
  path: 'home',
  canActivate: [AuthGuard],
}];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [
    RouterModule
  ],
})

export class FeaturesRoutingModule {

  public static ROUTES = routes;

}
