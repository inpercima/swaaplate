import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { NgModule } from '@angular/core';

import { FeaturesRoutingModule } from './features-routing.module';
import { MaterialModule } from '../material/material.module';

import { PROJECTDATA_DEFAULTCOMPONENT } from '../../components/PROJECTDATA_DEFAULTROUTE/PROJECTDATA_DEFAULTROUTE.component';

@NgModule({
  declarations: [
    PROJECTDATA_DEFAULTCOMPONENT,
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    FlexLayoutModule,
    MaterialModule,
  ],
})

export class FeaturesModule { }
