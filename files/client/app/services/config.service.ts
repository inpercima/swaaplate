import { Injectable } from '@angular/core';

import * as config from '../../../config/config.json';

@Injectable()
export class ConfigService {

  private appname: string;

  private theme: string;

  private activateLogin: boolean;

  private showLogin: boolean;

  private showFeatures: boolean;

  private defaultRoute: string;

  constructor() {
    this.appname = (<any>config).appname;
    this.theme = (<any>config).theme;
    this.activateLogin = (<any>config).activateLogin;
    this.showLogin = (<any>config).routes.showLogin;
    this.showFeatures = (<any>config).routes.showFeatures;
    this.defaultRoute = (<any>config).routes.defaultRoute;
  }

  public getAppname() {
    return this.appname;
  }

  public getTheme() {
    return this.theme;
  }

  public isActivateLogin() {
    return this.activateLogin;
  }

  public isShowLogin() {
    return this.showLogin;
  }

  public isShowFeatures() {
    return this.showFeatures;
  }

  public getDefaultRoute() {
    return this.defaultRoute;
  }

}
