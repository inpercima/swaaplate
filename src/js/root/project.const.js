'use strict';

module.exports = Object.freeze({
  // misc
  KOTLIN: 'kt',
  APP_RUNNING: ' app is running!',
  CONTENT_SPAN: '.content span',
  CONTENT_SPAN_REP: 'mat-toolbar',
  EMPTY: '',
  EOL: '$',
  EOL_EXPRESSION: '\\r?\\n\\s*\\n',
  GITIGNORE_URL: 'https://www.gitignore.io/api/node,angular,eclipse,intellij+all',

  // src
  SRC: 'src',
  SRC_ASSETS: 'src/assets',
  SRC_MAIN: 'src/main',
  SRC_TEST: 'src/test',
  SRC_TEMPLATE_ROOT_README: 'src/template/root/readme/',
  SRC_TEMPLATE_FRONTEND: 'src/template/frontend/',
  SRC_TEMPLATE_FRONTEND_FONTS: 'src/template/frontend/fonts/',
  SRC_TEMPLATE_FRONTEND_README: 'src/template/frontend/README.md',

  // by filename or foldername
  ANGULAR_JSON: 'angular.json',
  AUTH_SERVICE_PHP: 'auth.service.php',
  CONFIG: 'config',
  DOCKER: 'docker',
  DOCKERFILE: 'Dockerfile',
  DOCKER_COMPOSE_YML: 'docker-compose.yml',
  DOT_EDITORCONFIG: '.editorconfig',
  ENVIRONMENT_TS: 'environment.ts',
  ENVIRONMENT_DEV_TS: 'environment.dev.ts',
  ENVIRONMENT_MOCK_TS: 'environment.mock.ts',
  ENVIRONMENT_PROD_TS: 'environment.prod.ts',
  INDEX_HTML: 'index.html',
  LICENSE_MD: 'LICENSE.md',
  NODE_MODULES: 'node_modules',
  PACKAGE_JSON: 'package.json',
  README_MD: 'README.md',
  SWAAPLATE_JSON: 'swaaplate.json',
  WEBPACK_CONFIG_JS: 'webpack.config.js',

  // by name
  API: 'api',
  APP: 'app',
  BACKEND: 'backend',
  CORE: 'core',
  DIST: 'dist',
  FRONTEND: 'frontend',
  CYPRESS: 'cypress',
  JAVA: 'java',
  NESTJS: 'nestjs',
  MAVEN: 'maven',
  MOCK: 'mock',
  NONE: 'none',
  NPM: 'npm',
  PHP: 'php',
  UPDATE: 'update',
  YARN: 'yarn',

  // templates
  NAVIGATION: `  <nav mat-tab-nav-bar mat-stretch-tabs="false" [tabPanel]="tabPanel">
    <a mat-tab-link
      *ngFor="let routeLink of routes | appRouting"
      [routerLink]="routeLink.path"
      routerLinkActive #rla="routerLinkActive"
      [active]="rla.isActive">
      {{ routeLink.path }}
    </a>
  </nav>
  <mat-tab-nav-panel #tabPanel>
    <router-outlet></router-outlet>
  </mat-tab-nav-panel>`,

  // imports
  IMPORT_ANGULAR_ROUTER: `import { Routes } from '@angular/router';`,
  IMPORT_APP_ROUTING_MODULE: `import { AppRoutingModule } from './app-routing.module';`,
  IMPORT_APP_ROUTING_PIPE: `import { AppRoutingPipe } from './app-routing.pipe';`,
  IMPORT_FEATURES_MODULE: `import { FeaturesModule } from './features/features.module';`,
  IMPORT_FEATURES_ROUTING_MODULE: `import { FeaturesRoutingModule } from './features/features-routing.module';`,
  IMPORT_MATERIAL_TABS_MODULE: `import { MatTabsModule } from '@angular/material/tabs';`,
  IMPORT_NOT_FOUND_MODULE: `import { NotFoundModule } from './not-found/not-found.module';`,

  // route defintions
  ROUTES_DECLARATION: `  public routes: Routes;`,
  ROUTES_ALLOCATION: `    this.routes = AppRoutingModule.ROUTES;
    this.routes = this.routes.concat(FeaturesRoutingModule.ROUTES);`,
});
