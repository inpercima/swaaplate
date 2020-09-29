import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GeneratorComponent } from './generator/generator.component';


@NgModule({
  declarations: [ GeneratorComponent ],
  imports: [
    CommonModule,
  ],
  exports: [ GeneratorComponent ],
})
export class FeaturesModule { }
