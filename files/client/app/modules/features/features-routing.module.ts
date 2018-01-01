import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '../../services/auth-guard.service';

import { PROJECTDATA_DEFAULTCOMPONENT } from '../../components/PROJECTDATA_DEFAULTROUTE/PROJECTDATA_DEFAULTROUTE.component';

const routes: Routes = [{
  component: PROJECTDATA_DEFAULTCOMPONENT,
  path: 'PROJECTDATA_DEFAULTROUTE',
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
