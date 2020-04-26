'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swFrontendModule = require('./frontend-module');
const swHelper = require('../root/helper');
const swConst = require('../root/const');
const swVersion = require('../root/version');

let exp = {};
let projectConfig = {};
let projectPath = '';

/**
 * Configure the client.
 *
 * @param {string} workspacePath
 * @param {object} pConfig
 * @param {string} pPath
 */
function configure(workspacePath, pConfig, pPath) {
  projectConfig = pConfig;
  projectPath = pPath;

  const clientConfig = projectConfig.client;
  const pwd = shjs.pwd();
  const projectName = projectConfig.general.name;
  if (shjs.which('ng')) {
    shjs.cd(workspacePath);
    const params = [
      '--interactive=false --skipInstall=true --style=css',
      `--packageManager=${clientConfig.useYarn ? swConst.YARN : swConst.NPM}`,
      `--directory=${projectName}`,
      `--prefix=${clientConfig.prefix}`,
      `--routing=${clientConfig.routing.enabled}`
    ];
    lightjs.info(`run 'ng new ${projectName} ${params.join(" ")}'`);
    shjs.exec(`ng new ${projectName} ${params.join(" ")}`);
  } else {
    lightjs.error(`sorry, this script requires 'ng'`);
    shjs.exit(1);
  }
  shjs.cd(pwd);

  swFrontendModule.generateModulesAndComponents(projectConfig, projectPath);
  copyFiles();
  if (projectConfig.general.useMock) {
    prepareMock();
  }
  updateAngularJsonFile();
  updateEnvironmentTsFiles();
  replaceSectionsInFiles();
  updatePackageJsonFile();
  installDependencies();
}

/**
 * Copy client files.
 *
 */
function copyFiles() {
  lightjs.info('copy client files');

  const templatePath = 'src/template/client/';
  const srcPath = path.join(projectPath, swConst.SRC);
  shjs.cp(path.join(templatePath, 'src/favicon.ico'), srcPath);
  shjs.cp(path.join(templatePath, 'src/themes.scss'), srcPath);

  const coreFolder = 'core';
  const corePath = path.join(srcPath, swConst.APP, coreFolder);
  shjs.mkdir(corePath);
  shjs.cp('-r', path.join(templatePath, swConst.SRC, coreFolder, '*'), corePath);
}

/**
 * Prepares a mock.
 *
 */
function prepareMock() {
  lightjs.info('prepare mock');

  const templatePath = 'src/template/client/';
  const mockFolder = 'mock';
  const mockPath = path.join(projectPath, mockFolder);
  shjs.mkdir(mockPath);
  shjs.cp(path.join(templatePath, mockFolder, 'middleware.js'), mockPath);

  const generalConfig = projectConfig.general;
  const dbJsonData = {
    "users": [
      {
        "id": 1,
        "username": generalConfig.name,
        "password": generalConfig.name
      }
    ]
  };
  const dbJsonPath = path.join(mockPath, 'db.json');
  lightjs.writeJson(dbJsonPath, dbJsonData);
  lightjs.replacement('$', os.EOL, [dbJsonPath]);
}

/**
 * Update angular.json file.
 *
 */
function updateAngularJsonFile() {
  const angularJsonFile = path.join(projectPath, swConst.ANGULAR_JSON);
  let angularJsonData = lightjs.readJson(angularJsonFile);
  const generalConfig = projectConfig.general;
  const name = generalConfig.name;
  const clientConfig = projectConfig.client;
  const architectData = angularJsonData.projects[name].architect;
  architectData.build.options.outputPath = clientConfig.buildDir;
  if (projectConfig.server.backend === swConst.PHP) {
    architectData.build.options.customWebpackConfig = {
      path: './webpack.config.js'
    };
    architectData.build.builder = '@angular-builders/custom-webpack:browser';
    architectData.serve.builder = '@angular-builders/custom-webpack:dev-server';
  }
  architectData.build.options.styles.push('src/themes.scss');
  architectData.build.configurations.dev = addFileReplacementsAndBudgets('dev');
  if (generalConfig.useMock) {
    architectData.build.configurations.mock = addFileReplacementsAndBudgets('mock');
  }
  architectData.serve.configurations.dev = addBrowserTarget(name, 'dev');
  if (generalConfig.useMock) {
    architectData.serve.configurations.mock = addBrowserTarget(name, 'mock');
  }
  architectData.build.configurations.production.namedChunks = true;
  architectData.build.configurations.production.vendorChunk = true;
  angularJsonData.projects[name].architect = architectData;
  lightjs.writeJson(angularJsonFile, angularJsonData);
  lightjs.replacement('$', os.EOL, [path.join(projectPath, swConst.ANGULAR_JSON)]);
}

/**
 * Add file replacements and budgets.
 *
 */
function addFileReplacementsAndBudgets(mode) {
  return {
    fileReplacements: [
      {
        replace: 'src/environments/environment.ts',
        with: `src/environments/environment.${mode}.ts`
      }
    ],
    budgets: [
      {
        type: 'anyComponentStyle',
        maximumWarning: '6kb'
      }
    ]
  };
}

/**
 * Add browserTarget.
 *
 */
function addBrowserTarget(name, mode) {
  return {
    browserTarget: `${name}:build:${mode}`
  };
}

/**
 * Update environment.ts file.
 *
 */
function updateEnvironmentTsFiles() {
  const clientConfig = projectConfig.client;
  const clientConfigRouting = clientConfig.routing;
  const generalConfig = projectConfig.general;
  const serverConfig = projectConfig.server;
  const api = serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN ? 'http://localhost:8080/' : (serverConfig.backend === swConst.PHP && serverConfig.serverAsApi ? './api/' : './');
  const apiSuffix = serverConfig.backend === swConst.PHP && !serverConfig.htaccess ? `.${swConst.PHP}` : '';
  const environments = `activateLogin: ${clientConfigRouting.login.activate},
  api: '${api}',
  apiSuffix: '${apiSuffix}',
  appname: '${generalConfig.title}',
  defaultRoute: '${clientConfigRouting.features.default}',
  production: false,
  redirectNotFound: ${clientConfigRouting.notFound.redirect},
  showFeatures: ${clientConfigRouting.features.show},
  showLogin: ${clientConfigRouting.login.show},
  theme: '${clientConfig.theme}',`;

  const environmentsPath = path.join(projectPath, swConst.SRC, 'environments');
  lightjs.replacement('production: false', environments, [path.join(environmentsPath, swConst.ENVIRONMENT_TS)]);
  shjs.cp(path.join(environmentsPath, swConst.ENVIRONMENT_TS), path.join(environmentsPath, swConst.ENVIRONMENT_DEV_TS));
  if (generalConfig.useMock) {
    shjs.cp(path.join(environmentsPath, swConst.ENVIRONMENT_TS), path.join(environmentsPath, swConst.ENVIRONMENT_MOCK_TS));
  }
  shjs.cp(path.join(environmentsPath, swConst.ENVIRONMENT_TS), path.join(environmentsPath, swConst.ENVIRONMENT_PROD_TS));

  lightjs.replacement('(production: )false', `$1true`, [path.join(environmentsPath, swConst.ENVIRONMENT_PROD_TS)]);
  replaceCommentsInEnvironmentTsFile(environmentsPath, swConst.ENVIRONMENT_DEV_TS);
  if (generalConfig.useMock) {
    replaceCommentsInEnvironmentTsFile(environmentsPath, swConst.ENVIRONMENT_MOCK_TS);
  }
  replaceCommentsInEnvironmentTsFile(environmentsPath, swConst.ENVIRONMENT_PROD_TS);
}

function replaceCommentsInEnvironmentTsFile(environmentsPath, environmentTsFile) {
  const environmentFile = path.join(environmentsPath, environmentTsFile);
  // remove first lines in environment.x.ts files
  if (environmentTsFile !== swConst.ENVIRONMENT_TS) {
    lightjs.replacement('\\/\\/\\sTh.*|\\/\\/\\s`n.*', '', [environmentFile]);
    lightjs.replacement('\\r?\\n\\s*\\n(export)', '$1', [environmentFile]);
  }
  // remove last lines in environment.prod.ts files
  if (environmentTsFile === swConst.ENVIRONMENT_PROD_TS) {
    lightjs.replacement('\\/\\*.*|\\s\\*.*|\\/\\/.*', '', [environmentFile]);
    lightjs.replacement('(};)\\r?\\n\\s*\\n', `$1${os.EOL}${os.EOL}`, [environmentFile]);
    lightjs.replacement('(production: )false', `$1true`, [environmentFile]);
  }
}

/**
 * Remove trailing whitespaces, double line breaks, EOL and replace specific text sections they should be changed.
 *
 */
function replaceSectionsInFiles() {
  const generalConfig = projectConfig.general;
  // replace in e2e/
  lightjs.replacement('welcome message', 'title in toolbar', [path.join(projectPath, 'e2e', swConst.SRC, swConst.APP_E2E_SPEC_TS)]);
  lightjs.replacement(' app is running!', '', [path.join(projectPath, 'e2e', swConst.SRC, swConst.APP_E2E_SPEC_TS)]);
  lightjs.replacement('.content span', 'mat-toolbar', [path.join(projectPath, 'e2e', swConst.SRC, 'app.po.ts')]);
  lightjs.replacement(generalConfig.name, generalConfig.title, [path.join(projectPath, 'e2e', swConst.SRC, swConst.APP_E2E_SPEC_TS)]);
  lightjs.replacement('$', os.EOL, [path.join(projectPath, 'e2e', 'protractor.conf.js')]);

  const clientConfig = projectConfig.client;
  const srcPath = path.join(projectPath, swConst.SRC);
  // replace in index.html
  lightjs.replacement('(lang=")en', `$1${clientConfig.language}`, [path.join(srcPath, swConst.INDEX_HTML)]);
  lightjs.replacement('  <title>.*<\/title>', '', [path.join(srcPath, swConst.INDEX_HTML)]);
  lightjs.replacement('\\r?\\n\\s*\\n', os.EOL, [path.join(srcPath, swConst.INDEX_HTML)]);

  if (clientConfig.useGoogleFonts) {
    const fonts = `${createLink('icon?family=Material+Icons')}${os.EOL}${createLink('css?family=Roboto+Mono')}`;
    lightjs.replacement('(  <link rel="icon")', `${fonts}${os.EOL}$1`, [path.join(srcPath, swConst.INDEX_HTML)]);
  }

  const prefix = clientConfig.prefix;
  lightjs.replacement(`(<${prefix}-root>)(</${prefix}-root>)`, `$1Loading...$2`, [path.join(srcPath, swConst.INDEX_HTML)]);

  // replace in app.component.spec.ts
  const tabsImport = `import { MatTabsModule } from '@angular/material/tabs';`
  const toolbarImport = `import { MatToolbarModule } from '@angular/material/toolbar';`;
  const pipeImport = `import { AppRoutingPipe } from './app-routing.pipe';`;
  const specPath = path.join(projectPath, swConst.SRC, swConst.APP, 'app.component.spec.ts');
  lightjs.replacement(`(router/testing';)`, `$1${os.EOL}${tabsImport}${os.EOL}${toolbarImport}${os.EOL}`, [specPath]);
  lightjs.replacement(`(component';)`, `$1${os.EOL}${pipeImport}`, [specPath]);
  lightjs.replacement('(imports: \\[)', `$1${os.EOL}        MatTabsModule,${os.EOL}        MatToolbarModule,`, [specPath]);
  lightjs.replacement('(declarations: \\[\\n        AppComponent)', `$1,${os.EOL}        AppRoutingPipe`, [specPath]);

  lightjs.replacement(generalConfig.name, generalConfig.title, [specPath]);
  lightjs.replacement(' app is running!', '', [specPath]);
  lightjs.replacement('.content span', 'mat-toolbar', [specPath]);
  lightjs.replacement('(as )title', '$1appname', [specPath]);
  lightjs.replacement('(app.)title', '$1appname', [specPath]);
  lightjs.replacement('(render )title', '$1toolbar', [specPath]);

  // misc
  lightjs.replacement('$', `@import 'app/app.component.css';${os.EOL}`, [path.join(projectPath, swConst.SRC, 'styles.css')]);
  lightjs.replacement('$', os.EOL, [path.join(projectPath, 'tslint.json')]);
}

/**
 * Create a link for font files.
 *
 */
function createLink(font) {
  return `  <link href="https://fonts.googleapis.com/${font}" rel="stylesheet">`;
}

/**
 * Update package.json file.
 *
 */
function updatePackageJsonFile() {
  const packageJsonFile = path.join(projectPath, swConst.PACKAGE_JSON);
  let packageJsonData = lightjs.readJson(packageJsonFile);
  const generalConfig = projectConfig.general;

  const mockScripts = {
    "build:mock": "ng lint && ng build --configuration=mock",
    "run:mock": "json-server mock/db.json --middlewares mock/middleware.js",
    "serve:mock": "ng serve -o --configuration=mock",
    "watch:mock": "ng build --watch --configuration=mock",
  };
  let scripts = {
    "build:dev": "ng lint && ng build --configuration=dev",
    "serve:dev": "ng serve -o --configuration=dev",
    "watch:dev": "ng build --watch --configuration=dev",
  };
  if (generalConfig.useMock) {
    Object.assign(scripts, mockScripts);
  }
  Object.assign(scripts, { "build:prod": "ng lint && ng build --prod" });

  let packageJsonTemplateData = {};
  const clientConfig = projectConfig.client;
  packageJsonTemplateData.author = generalConfig.author;
  packageJsonTemplateData.contributors = clientConfig.packageJson.contributors;
  packageJsonTemplateData.dependencies = packageJsonData.dependencies;
  packageJsonTemplateData.dependencies['@angular/cdk'] = swVersion.ANGULAR_CDK;
  packageJsonTemplateData.dependencies['@angular/flex-layout'] = swVersion.ANGULAR_FLEX;
  packageJsonTemplateData.dependencies['@angular/material'] = swVersion.ANGULAR_CDK;
  packageJsonTemplateData.dependencies['@auth0/angular-jwt'] = swVersion.ANGULAR_JWT;
  if (generalConfig.useMock) {
    packageJsonTemplateData.dependencies['json-server'] = swVersion.JSON_SERVER;
    packageJsonTemplateData.dependencies['jsonwebtoken'] = swVersion.JSONWEBTOKEN;
  }
  packageJsonTemplateData.description = generalConfig.description;
  packageJsonTemplateData.devDependencies = packageJsonData.devDependencies;
  const serverConfig = projectConfig.server;
  if (serverConfig.backend === swConst.PHP) {
    packageJsonTemplateData.devDependencies['copy-webpack-plugin'] = swVersion.COPY_WEBPACK_PLUGIN;
    packageJsonTemplateData.devDependencies['@angular-builders/custom-webpack'] = swVersion.CUSTOM_WEBPACK;
    if (generalConfig.useMock) {
      scripts['build:mock'] = updateTask(scripts, 'build:mock');
      scripts['watch:mock'] = updateTask(scripts, 'watch:mock');
    }
  }
  packageJsonTemplateData.engines = {
    node: '>=' + swVersion.NODE,
  };
  packageJsonTemplateData.homepage = clientConfig.packageJson.homepage;
  if (generalConfig.useMITLicense) {
    packageJsonTemplateData.license = 'MIT';
  }
  packageJsonTemplateData.name = generalConfig.name;
  packageJsonTemplateData.private = true;
  packageJsonTemplateData.repository = clientConfig.packageJson.repository;
  if (serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN) {
    scripts['serve:dev'] = 'ng serve -o --configuration=dev';
  }
  packageJsonTemplateData.scripts = scripts;
  packageJsonTemplateData.version = '1.0.0-SNAPSHOT';

  lightjs.writeJson(packageJsonFile, packageJsonTemplateData);
  lightjs.replacement('$', os.EOL, [packageJsonFile]);
}

/**
 * Updates a task in package.json.
 *
 * @param {object} packageJsonData
 * @param {string} mockTask
 */
function updateTask(packageJsonData, mockTask) {
  return `export NODE_ENV='mock' && ${packageJsonData[mockTask]}`;
}

/**
 * Installs dependencies.
 *
 */
function installDependencies() {
  lightjs.info('install dependencies');

  if (projectConfig.client.installDependencies) {
    const pwd = shjs.pwd();
    shjs.cd(projectPath);
    lightjs.setNpmDefault(!projectConfig.client.useYarn);
    lightjs.yarnpm('install');
    shjs.cd(pwd);
  } else {
    lightjs.info('no dependencies will be installed');
  }
}

/**
 * Updates dependencies.
 *
 * @param {string} pPath
 */
function updateDependencies(pPath) {
  lightjs.info('update dependencies');

  if (shjs.which('ng')) {
    const pwd = shjs.pwd();
    if (!swHelper.isJs()) {
      shjs.cd(path.join(pPath, swConst.CLIENT));
    } else {
      shjs.cd(pPath);
    }
    shjs.exec('ng update --all --allowDirty=true --force=true');
    shjs.cd(pwd);
  } else {
    lightjs.error(`sorry, this script requires 'ng'`);
    shjs.exit(1);
  }
}

exp.configure = configure;
exp.updateDependencies = updateDependencies;

module.exports = exp;
