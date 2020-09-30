import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../shared/material/material.module';
import { GeneratorComponent } from './generator/generator.component';


@NgModule({
  declarations: [ GeneratorComponent ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    ReactiveFormsModule,
  ],
  exports: [ GeneratorComponent ],
})
export class FeaturesModule { }
