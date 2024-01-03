import { Component, Inject } from '@angular/core';{{PROJECT.ROUTESMODULE}}
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';

{{PROJECT.APPROUTINGMODULE}}{{PROJECT.FEATURESROUTINGMODULE}}import { environment } from '../environments/environment';

@Component({
  selector: '{{PROJECT.PREFIX}}-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  public appname: string;{{PROJECT.ROUTESDECLARATION}}

  public constructor(private titleService: Title, @Inject(DOCUMENT) private document: Document) {
    this.appname = environment.appname;{{PROJECT.ROUTESALLOCATION}}
    this.titleService.setTitle(this.appname);
    this.document.body.classList.add(`${environment.theme}-theme`);
  }
}
