'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const uppercamelcase = require('uppercamelcase');
const shjs = require('shelljs');

const swConst = require('../const.js');

/**
 * Create the project client-side.
 *
 * @param {string} workspacePath
 */
function create(workspacePath) {
  const clientConfig = exp.config.client;
  const pwd = shjs.pwd();
  const name = exp.config.general.name;
  if (shjs.which('ng')) {
    shjs.cd(workspacePath);
    const packageManager = clientConfig.useYarn ? swConst.YARN : swConst.NPM;
    const directoryStyle = `--directory=${name} --style=css --packageManager=${packageManager}`;
    const prefixRouting = `--prefix=${clientConfig.prefix} --routing=${clientConfig.routing.enabled}`;

    lightjs.info(`run 'ng new ${name} --interactive=false --skipInstall=true ${directoryStyle} ${prefixRouting}'`);
    shjs.exec(`ng new ${name} --interactive=false --skipInstall=true ${directoryStyle} ${prefixRouting}`);
  } else {
    lightjs.error(`sorry, this script requires 'ng'`);
    shjs.exit(1);
  }
  shjs.cd(pwd);

  generateModulesAndComponents();
  copyFiles();
  updateAngularJson();
  updateEnvironmentTs();
  prettifyFiles();
  replaceKnownSections();
  replacePlaceholder();
  installDependencies();
}

/**
 * Copy files for the client.
 *
 */
function copyFiles() {
  lightjs.info('copy client files');

  const templatePath = 'src/template/client/';

  const mockFolder = 'mock';
  const mockPath = path.join(exp.projectPath, mockFolder);
  shjs.mkdir(mockPath);
  shjs.cp(path.join(templatePath, mockFolder, '*'), mockPath);

  const srcPath = path.join(exp.projectPath, swConst.SRC);
  shjs.cp(path.join(templatePath, 'src/favicon.ico'), srcPath);
  shjs.cp(path.join(templatePath, 'src/themes.scss'), srcPath);

  shjs.cp('src/template/package.json', exp.projectPath);

  const coreFolder = 'core';
  const corePath = path.join(srcPath, swConst.APP, coreFolder);
  shjs.mkdir(corePath);
  shjs.cp('-r', path.join(templatePath, swConst.SRC, coreFolder, '*'), corePath);
}

function updateAngularJson() {
  const angularJsonFile = path.join(exp.projectPath, swConst.ANGULAR_JSON);
  let angularJsonData = lightjs.readJson(angularJsonFile);
  const name = exp.config.general.name;
  const clientConfig = exp.config.client;
  const architectData = angularJsonData.projects[name].architect;
  architectData.build.options.outputPath = clientConfig.buildDir;
  architectData.build.options.styles.push('src/themes.scss');

  architectData.build.configurations.dev = {
    fileReplacements: [
      {
        replace: 'src/environments/environment.ts',
        with: 'src/environments/environment.dev.ts'
      }
    ],
    budgets: [
      {
        type: 'anyComponentStyle',
        maximumWarning: '6kb'
      }
    ]
  };
  architectData.build.configurations.mock = {
    fileReplacements: [
      {
        replace: 'src/environments/environment.ts',
        with: 'src/environments/environment.mock.ts'
      }
    ],
    budgets: [
      {
        type: 'anyComponentStyle',
        maximumWarning: '6kb'
      }
    ]
  };

  architectData.serve.configurations.dev = {
    browserTarget: `${name}:build:dev`
  };
  architectData.serve.configurations.mock = {
    browserTarget: `${name}:build:mock`
  };

  architectData.build.configurations.production.namedChunks = true;
  architectData.build.configurations.production.vendorChunk = true;
  angularJsonData.projects[exp.config.general.name].architect = architectData;
  lightjs.writeJson(angularJsonFile, angularJsonData);
}

function updateEnvironmentTs() {
  const environments = `activateLogin: true,
  api: './',
  apiSuffix: '',
  appname: 'angular-cli-for-swaaplate',
  defaultRoute: 'dashboard',
  production: false,
  redirectNotFound: false,
  showFeatures: true,
  showLogin: false,
  theme: 'indigo-pink',`;
  lightjs.replacement('production: false', environments, [path.join(exp.projectPath, swConst.SRC, 'environments', swConst.ENVIRONMENT_TS)]);
}

/**
 * Generate components for the client.
 *
 */
function generateModulesAndComponents() {
  const clientConfigRouting = exp.config.client.routing;
  if (clientConfigRouting.enabled) {
    lightjs.info('routing is activated ...');
    generateModuleAndComponent(true, 'features', clientConfigRouting.features.default);
    const clientConfigLogin = clientConfigRouting.login;
    const login = clientConfigLogin.name;
    generateModuleAndComponent(clientConfigLogin.enabled, login, login);
    const clientConfigNotFound = clientConfigRouting.notFound;
    const notFound = clientConfigNotFound.name;
    generateModuleAndComponent(clientConfigNotFound.enabled, notFound, notFound);

    copyExtraModuleFiles(swConst.APP);
    addRouteInformation(swConst.APP, null);
  } else {
    lightjs.info('routing is deactivated, no modules and components will be generated');
  }
}

/**
 * Generate a single module and component.
 *
 */
function generateModuleAndComponent(generate, module, component) {
  if (generate) {
    const pwd = shjs.pwd();
    shjs.cd(exp.projectPath);

    lightjs.info(`... generate module '${module}'`);
    shjs.exec(`ng g m ${module} --routing=true`);
    lightjs.info(`... generate component '${component}'`);
    const moduleComponent = module === component ? module : `${module}/${component}`;
    shjs.exec(`ng g c ${moduleComponent}`);

    shjs.cd(pwd);

    copyExtraModuleFiles(module);
    addRouteInformation(module, component);
  }
}

/**
 * Copy extra files for a module.
 *
 */
function copyExtraModuleFiles(module) {
  lightjs.info(`copy module spec files for '${module}'`);

  const templatePath = `src/template/client/src`;
  const appPath = path.join(exp.projectPath, swConst.SRC, swConst.APP);
  if (module === swConst.APP) {
    shjs.cp('-r', path.join(templatePath, `${swConst.APP}*`), appPath);
  } else {
    shjs.cp('-r', path.join(templatePath, module, '*'), path.join(appPath, module));
  }
}

/**
 * Add route information to module.
 *
 */
function addRouteInformation(module, component) {
  lightjs.info(`add routes to module '${module}'`);

  const twoEol = os.EOL + os.EOL;
  const moduleName = uppercamelcase(module);
  const routingModuleFile = path.join(exp.projectPath, swConst.SRC, module === swConst.APP ? '' : swConst.APP, module, `${module}-routing.module.ts`);

  const routes = addRoute(module, moduleName);
  lightjs.replacement('(Routes = \\[)', `$1${routes}`, [routingModuleFile]);

  const clientConfigRouting = exp.config.client.routing;
  const componentName = module === 'features' ? uppercamelcase(component) : moduleName;
  const authGuardImport = module === 'features' ? `${twoEol}import { AuthGuard } from '../core/auth-guard.service';` : '';
  const lineBreakComponent = module === 'features' ? os.EOL : twoEol;
  const componentFolder = module === 'features' ? `${component}/` : '';
  const componentImport = module === swConst.APP ? '' : `${lineBreakComponent}import { ${componentName}Component } from './${componentFolder}${component}.component';`;
  const lineBreakEnvironment = module === swConst.APP ? twoEol : os.EOL;
  const environmentFolder = module === swConst.APP ? '' : '../';
  const environmentImport = module === clientConfigRouting.login.name ? '' : `${lineBreakEnvironment}import { environment } from '../${environmentFolder}environments/environment';`;
  lightjs.replacement(`(router';)`, `$1${authGuardImport}${componentImport}${environmentImport}`, [routingModuleFile]);

  const routingModule = `${moduleName}RoutingModule`;
  const typeRoutes = module === swConst.APP ? ': Routes' : '';
  const staticRoutes = `public static ROUTES${typeRoutes} = routes;`;
  lightjs.replacement(`(${routingModule} {) }`, `$1${twoEol}  ${staticRoutes}${twoEol}}`, [routingModuleFile]);
}

/**
 * Add route to module.
 *
 */
function addRoute(module, moduleName) {
  const clientConfigRouting = exp.config.client.routing;
  let routes = '';
  if (module === clientConfigRouting.login.name) {
    routes = `{
  component: ${moduleName}Component,
  path: 'login',
}`;
  } else if (module === clientConfigRouting.notFound.name) {
    routes = `environment.redirectNotFound ? {
  path: '**',
  redirectTo: environment.defaultRoute
} : {
  component: NotFoundComponent,
  path: '**',
}`;
  } else if (module === 'features') {
    routes = `{
  canActivate: [AuthGuard],
  component: DashboardComponent,
  path: environment.defaultRoute,
}`;
  }
  else {
    routes = `{
  path: '',
  pathMatch: 'full',
  redirectTo: environment.defaultRoute,
}`;
  }
  return routes;
}

/**
 * Edit files and remove trailing whitespaces, double empty lines and so on.
 *
 */
function prettifyFiles() {
  const replaceLineBreak = '\\n\\n\\n';
  const twoEol = `${os.EOL}${os.EOL}`;
  const clientConfigRouting = exp.config.client.routing;
  if (clientConfigRouting.enabled) {
    lightjs.replacement(replaceLineBreak, twoEol, [path.join(exp.projectPath, swConst.SRC, swConst.APP, 'features')], true, true);
  }
  if (clientConfigRouting.enabled && clientConfigRouting.notFound.enabled) {
    lightjs.replacement(replaceLineBreak, twoEol, [path.join(exp.projectPath, swConst.SRC, swConst.APP, clientConfigRouting.notFound.name)], true, true);
  }
  if (clientConfigRouting.enabled && clientConfigRouting.login.enabled) {
    lightjs.replacement(replaceLineBreak, twoEol, [path.join(exp.projectPath, swConst.SRC, swConst.APP, clientConfigRouting.login.name)], true, true);
  }

  lightjs.replacement(replaceLineBreak, twoEol, [path.join(exp.projectPath, swConst.SRC, swConst.APP, 'app-routing.module.ts')]);

  lightjs.replacement('$', os.EOL, [path.join(exp.projectPath, swConst.TSLINT_JSON)]);
  lightjs.replacement('$', os.EOL, [path.join(exp.projectPath, 'e2e', 'protractor.conf.js')]);
  lightjs.replacement('$', os.EOL, [path.join(exp.projectPath, swConst.ANGULAR_JSON)]);
  lightjs.replacement('$', `@import 'app/app.component.css';\n`, [path.join(exp.projectPath, swConst.SRC, 'styles.css')]);
}

/**
 * Replace specific text sections they should be changed.
 *
 */
function replaceKnownSections() {
  lightjs.replacement('welcome message', 'title in toolbar', [path.join(exp.projectPath, 'e2e', swConst.SRC, swConst.APP_E2E_SPEC_TS)]);
  lightjs.replacement(' app is running!', '', [path.join(exp.projectPath, 'e2e', swConst.SRC, swConst.APP_E2E_SPEC_TS)]);
  lightjs.replacement('.content span', 'mat-toolbar', [path.join(exp.projectPath, 'e2e', swConst.SRC, swConst.APP_PO_TS)]);

  lightjs.replacement('(lang=")en', `$1${exp.config.client.language}`, [path.join(exp.projectPath, swConst.SRC, swConst.INDEX_HTML)]);
  lightjs.replacement('  <title>.*<\/title>', '', [path.join(exp.projectPath, swConst.SRC, swConst.INDEX_HTML)]);
  lightjs.replacement('\\r?\\n\\s*\\n', os.EOL, [path.join(exp.projectPath, swConst.SRC, swConst.INDEX_HTML)]);

  const fonts = `${createLink('icon?family=Material+Icons')}${os.EOL}${createLink('css?family=Roboto+Mono')}`;
  lightjs.replacement('(  <link rel="icon")', `${fonts}${os.EOL}$1`, [path.join(exp.projectPath, swConst.SRC, swConst.INDEX_HTML)]);

  const prefix = exp.config.client.prefix;
  lightjs.replacement(`(<${prefix}-root>)(</${prefix}-root>)`, `$1Loading...$2`, [path.join(exp.projectPath, swConst.SRC, swConst.INDEX_HTML)]);
}

/**
 * Create a link for font files.
 *
 */
function createLink(font) {
  return `  <link href="https://fonts.googleapis.com/${font}" rel="stylesheet">`;
}

/**
 * Replace project specific values in client.
 *
 */
function replacePlaceholder() {
  lightjs.replacement('{{PROJECT.NAME}}', exp.config.general.name, [exp.projectPath], true, true);
}


/**
 * Install the dependencies for the client.
 *
 */
function installDependencies() {
  lightjs.info('install dependencies');

  if (exp.config.client.installDependencies) {
    const pwd = shjs.pwd();
    shjs.cd(exp.projectPath);
    lightjs.setNpmDefault = !exp.config.client.useYarn;
    lightjs.yarnpm('install');
    shjs.cd(pwd);
  } else {
    lightjs.info('no dependencies will be installed');
  }
}

let exp = {};
exp.config = {};
exp.projectPath = '';
exp.create = create;

module.exports = exp;
