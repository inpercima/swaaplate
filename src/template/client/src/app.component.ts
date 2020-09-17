import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, HostBinding } from '@angular/core';{{PROJECT.ROUTESMODULE}}
import { Title } from '@angular/platform-browser';

{{PROJECT.APPROUTINGMODULE}}{{PROJECT.FEATURESROUTINGMODULE}}import { environment } from '../environments/environment';

@Component({
  selector: '{{PROJECT.PREFIX}}-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {

  public appname: string;{{PROJECT.ROUTESDECLARATION}}

  /**
   * Adds the custom theme to the app root.
   * For overlays the OverlayContainer like in the constructor is used.
   * For dialogs the panelClass of the configuration must added manually like
   *
   * const dialogConfig = new MatDialogConfig();
   * dialogConfig.panelClass = `${environment.theme}-theme`;
   */
  @HostBinding('class') class = `${environment.theme}-theme`;

  public constructor(private titleService: Title, public overlayContainer: OverlayContainer) {
    this.appname = environment.appname;{{PROJECT.ROUTESALLOCATION}}
    this.titleService.setTitle(this.appname);
    this.overlayContainer.getContainerElement().classList.add(`${environment.theme}-theme`);
  }
}
