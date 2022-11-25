import { OverlayModule } from '@angular/cdk/overlay';
import { NgModule } from '@angular/core';{{PROJECT.MATERIALTABSMODULE}}
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';{{PROJECT.APPROUTING}}{{PROJECT.FEATURESMODULE}}{{PROJECT.NOTFOUNDMODULE}}

@NgModule({
  declarations: [
    AppComponent,{{PROJECT.APPROUTINGPIPENAME}}
  ],
  imports: [
    BrowserAnimationsModule,
    BrowserModule,{{PROJECT.MATERIALTABSMODULENAME}}
    MatToolbarModule,
    OverlayModule,{{PROJECT.APPROUTINGMODULENAME}}{{PROJECT.FEATURESMODULENAME}}{{PROJECT.NOTFOUNDMODULENAME}}
  ],
  providers: [],
  bootstrap: [
    AppComponent,
  ],
})
export class AppModule { }
