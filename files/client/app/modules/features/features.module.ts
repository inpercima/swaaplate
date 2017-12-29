import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from "@angular/flex-layout";
import { NgModule } from '@angular/core';

import { FeaturesRoutingModule } from './features-routing.module';
import { MaterialModule } from '../material/material.module';

import { HomeComponent } from '../../components/home/home.component';

@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    FeaturesRoutingModule,
    FlexLayoutModule,
    MaterialModule,
  ],
})

export class FeaturesModule { }
