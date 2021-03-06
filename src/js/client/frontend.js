'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../root/const');
const swFrontendModule = require('./frontend-module');
const swHelper = require('../root/helper');
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
      '--interactive=false --skip-install=true --style=css',
      `--package-manager=${swHelper.isYarn() ? swConst.YARN : swConst.NPM}`,
      `--directory=${projectName}`,
      `--prefix=${clientConfig.prefix}`,
      `--routing=${swHelper.isRouting()}`
    ];
    lightjs.info(`run 'ng new ${projectName} ${params.join(" ")}'`);
    shjs.exec(`ng new ${projectName} ${params.join(" ")}`);

    shjs.cd(path.join(workspacePath, projectName));
    const addCypress = 'ng add @cypress/schematic --skip-confirmation=true';
    lightjs.info(`run '${addCypress}'`);
    shjs.exec(`${addCypress}`);
    const esLint = 'ng add @angular-eslint/schematics --skip-confirmation=true';
    lightjs.info(`run '${esLint}'`);
    shjs.exec(`${esLint}`);
  } else {
    lightjs.error(`sorry, this script requires 'ng'`);
    shjs.exit(1);
  }
  shjs.cd(pwd);

  swFrontendModule.generateModulesAndComponents(projectConfig, projectPath);
  copyFiles();
  prepareMock();
  updateAngularJsonFile();
  updateEnvironmentTsFiles();
  replaceSectionsInFiles();
  replaceTemplatesInFiles();
  updatePackageJsonFile();
  installDependencies();
}

/**
 * Copy client files.
 *
 */
function copyFiles() {
  lightjs.info('task: copy client files');

  const srcPath = path.join(projectPath, swConst.SRC);
  shjs.cp(path.join(swConst.SRC_TEMPLATE_CLIENT, 'src/favicon.ico'), srcPath);
  shjs.cp(path.join(swConst.SRC_TEMPLATE_CLIENT, 'src/themes.scss'), srcPath);

  const generalConfig = projectConfig.general;
  if (projectConfig.general.useSecurity) {
    lightjs.info('      option useSecurity is activated: copy authentication files');
    const corePath = path.join(srcPath, swConst.APP, swConst.CORE);
    shjs.mkdir(corePath);
    shjs.cp('-r', path.join(swConst.SRC_TEMPLATE_CLIENT, swConst.SRC, swConst.CORE, '*'), corePath);
  } else {
    lightjs.info('      option useSecurity is deactivated: nothing todo');
  }

  if (generalConfig.modRewriteIndex) {
    shjs.cp(path.join(swConst.SRC_TEMPLATE_CLIENT, 'src/.htaccess'), srcPath);
  }
}

/**
 * Prepares a mock.
 *
 */
function prepareMock() {
  lightjs.info('task: prepare mock');

  if (swHelper.isMock()) {
    lightjs.info('      option useMock is activated, prepare files for mock');

    const mockPath = path.join(projectPath, swConst.MOCK);
    shjs.mkdir(mockPath);
    shjs.cp(path.join(swConst.SRC_TEMPLATE_CLIENT, swConst.MOCK, 'middleware.js'), mockPath);

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
  } else {
    lightjs.info('      option useMock is deactivated: nothing todo');
  }
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
  if (swHelper.isPhp()) {
    architectData.build.options.customWebpackConfig = {
      path: './webpack.config.js'
    };
    architectData.build.builder = '@angular-builders/custom-webpack:browser';
    architectData.serve.builder = '@angular-builders/custom-webpack:dev-server';
  }
  architectData.build.options.styles.push('src/themes.scss');
  architectData.build.configurations.development.budgets = addBudgets();
  architectData.build.configurations.development.fileReplacements = addFileReplacements('dev');
  if (swHelper.isMock()) {
    architectData.build.configurations.mock = addFileReplacementsAndBudgets('mock');
  }
  if (swHelper.isMock()) {
    architectData.serve.configurations.mock = addBrowserTarget(name, 'mock');
  }

  if (generalConfig.modRewriteIndex) {
    const assets = architectData.build.options.assets;
    assets.unshift("src/.htaccess");
    architectData.build.options.assets = assets;
  }

  /**
   * For production also add namedChunks and vendorChunk.
   */
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
    fileReplacements: addFileReplacements(mode),
    budgets: addBudgets(),
  };
}

/**
 * Add file replacements.
 *
 */
function addFileReplacements(mode) {
  return [
    {
      replace: 'src/environments/environment.ts',
      with: `src/environments/environment.${mode}.ts`
    }
  ];
}

/**
 * Add budgets.
 *
 */
function addBudgets() {
  return [
    {
      type: 'initial',
      maximumWarning: '500kb',
      maximumError: '1mb'
    },
    {
      type: 'anyComponentStyle',
      maximumWarning: '2kb',
      maximumError: '4kb'
    }
  ];
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
  const modulesConfig = clientConfig.modules;
  const generalConfig = projectConfig.general;
  const serverConfig = projectConfig.server;
  const api = swHelper.isJavaKotlin() ? 'http://localhost:8080/' : (swHelper.isPhp() && serverConfig.php.serverAsApi ? './api/' : './');
  const environments = `api: '${api}',
  appname: '${generalConfig.title}',
  defaultRoute: '${modulesConfig.features.defaultRoute}',
  production: false,
  theme: '${clientConfig.theme}',`;

  const environmentsPath = path.join(projectPath, swConst.SRC, 'environments');

  createEnvironmentTsFile(environments, environmentsPath, swConst.ENVIRONMENT_DEV_TS);
  if (swHelper.isMock()) {
    createEnvironmentTsFile(environments, environmentsPath, swConst.ENVIRONMENT_MOCK_TS);
  }
  createEnvironmentTsFile(environments, environmentsPath, swConst.ENVIRONMENT_PROD_TS);

  lightjs.replacement('production: false', environments, [path.join(environmentsPath, swConst.ENVIRONMENT_TS)]);
  lightjs.replacement('(production: )false', `$1true`, [path.join(environmentsPath, swConst.ENVIRONMENT_PROD_TS)]);
}

function createEnvironmentTsFile(environments, environmentsPath, environmentTsFile) {
  shjs.cp(path.join(environmentsPath, swConst.ENVIRONMENT_TS), path.join(environmentsPath, environmentTsFile));
  replaceCommentsInEnvironmentTsFile(environmentsPath, environmentTsFile);
  lightjs.replacement('production: false', environments, [path.join(environmentsPath, environmentTsFile)]);
}

function replaceCommentsInEnvironmentTsFile(environmentsPath, environmentTsFile) {
  const environmentFile = path.join(environmentsPath, environmentTsFile);
  // remove first lines in environment.x.ts files
  if (environmentTsFile !== swConst.ENVIRONMENT_TS) {
    lightjs.replacement('\\/\\/\\sTh.*|\\/\\/\\s`n.*', swConst.EMPTY, [environmentFile]);
    lightjs.replacement(`${swConst.EOL_EXPRESSION}(export)`, '$1', [environmentFile]);
  }
  // remove last lines in environment.prod.ts files
  if (environmentTsFile === swConst.ENVIRONMENT_PROD_TS) {
    lightjs.replacement('\\/\\*.*|\\s\\*.*|\\/\\/.*', '', [environmentFile]);
    lightjs.replacement(`(};)${swConst.EOL_EXPRESSION}`, `$1${os.EOL}`, [environmentFile]);
  }
}

/**
 * Remove trailing whitespaces, double line breaks, EOL and replace specific text sections they should be changed.
 *
 */
function replaceSectionsInFiles() {
  const generalConfig = projectConfig.general;
  // replace in cypress/
  const cypress = path.join(projectPath, swConst.CYPRESS);
  const cypressIntegrationSpec = path.join(cypress, 'integration', 'spec.ts');
  lightjs.replacement('Welcome', 'Hello world', [cypressIntegrationSpec]);
  lightjs.replacement('sandbox app is running!', 'hello-world works!', [cypressIntegrationSpec]);

  const clientConfig = projectConfig.client;
  const srcPath = path.join(projectPath, swConst.SRC);
  // replace in index.html
  const indexHtmlPath = path.join(srcPath, swConst.INDEX_HTML);
  lightjs.replacement('(lang=")en', `$1${clientConfig.language}`, [indexHtmlPath]);
  lightjs.replacement('  <title>.*<\/title>', swConst.EMPTY, [indexHtmlPath]);
  lightjs.replacement(swConst.EOL_EXPRESSION, os.EOL, [indexHtmlPath]);

  if (clientConfig.useGoogleFonts) {
    const fonts = `${createLink('Material+Icons')}${os.EOL}${createLink('Roboto:wght@400;700&display=swap')}`;
    lightjs.replacement('(  <link rel="icon")', `${fonts}${os.EOL}$1`, [indexHtmlPath]);
  }

  const prefix = clientConfig.prefix;
  lightjs.replacement(`(<${prefix}-root>)(</${prefix}-root>)`, '$1Loading...$2', [indexHtmlPath]);

  // replace in app.component.spec.ts
  const tabsImport = swHelper.isRouting() ? `${swConst.IMPORT_MATERIAL_TABS_MODULE}${os.EOL}` : '';
  const toolbarImport = `import { MatToolbarModule } from '@angular/material/toolbar';`;
  const pipeImport = swHelper.isRouting() ? os.EOL + swConst.IMPORT_APP_ROUTING_PIPE : '';
  const specPath = path.join(projectPath, swConst.SRC, swConst.APP, 'app.component.spec.ts');
  const tabsModule = swHelper.isRouting() ? `${os.EOL}        MatTabsModule,` : '';
  const routingPipe = swHelper.isRouting() ? `${os.EOL}        AppRoutingPipe` : '';
  lightjs.replacement(`(core/testing';)`, `$1${os.EOL}${tabsImport}${toolbarImport}${os.EOL}`, [specPath]);
  lightjs.replacement(`(component';)`, `$1${pipeImport}`, [specPath]);
  if (swHelper.isRouting()) {
    lightjs.replacement('(imports: \\[)', `$1${tabsModule}${os.EOL}        MatToolbarModule,`, [specPath]);
  } else {
    lightjs.replacement('(configureTestingModule\\({)', `$1${os.EOL}      imports: [${os.EOL}        MatToolbarModule,${os.EOL}      ],`, [specPath]);
  }
  lightjs.replacement('(declarations: \\[\\n        AppComponent)', `$1,${routingPipe}`, [specPath]);

  lightjs.replacement(generalConfig.name, generalConfig.title, [specPath]);
  lightjs.replacement(swConst.APP_RUNNING, swConst.EMPTY, [specPath]);
  lightjs.replacement(swConst.CONTENT_SPAN, swConst.CONTENT_SPAN_REP, [specPath]);
  lightjs.replacement('(as )title', '$1appname', [specPath]);
  lightjs.replacement('(app.)title', '$1appname', [specPath]);
  lightjs.replacement('(render )title', '$1toolbar', [specPath]);

  // misc
  lightjs.replacement(swConst.EOL, `@import 'app/app.component.css';${os.EOL}`, [path.join(projectPath, swConst.SRC, 'styles.css')]);
}

/**
 * Replace templates in template files.
 *
 */
function replaceTemplatesInFiles() {
  // replace in app.module.ts
  const appModuleTsPath = path.join(projectPath, swConst.SRC, swConst.APP, 'app.module.ts');
  const clientConfig = projectConfig.client;
  const modulesConfig = clientConfig.modules;
  lightjs.replacement('{{PROJECT.MATERIALTABSMODULE}}', swHelper.isRouting() ? os.EOL + swConst.IMPORT_MATERIAL_TABS_MODULE : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.APPROUTING}}', swHelper.isRouting() ? os.EOL + swConst.IMPORT_APP_ROUTING_MODULE + os.EOL + swConst.IMPORT_APP_ROUTING_PIPE : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.FEATURESMODULE}}', swHelper.isRouting() || modulesConfig.enabled ? os.EOL + swConst.IMPORT_FEATURES_MODULE : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.NOTFOUNDMODULE}}', swHelper.isRouting() && modulesConfig.notFound.enabled ? os.EOL + swConst.IMPORT_NOT_FOUND_MODULE : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.APPROUTINGPIPENAME}}', swHelper.isRouting() ? os.EOL + '    AppRoutingPipe,' : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.MATERIALTABSMODULENAME}}', swHelper.isRouting() ? os.EOL + '    MatTabsModule,' : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.APPROUTINGMODULENAME}}', swHelper.isRouting() ? os.EOL + '    AppRoutingModule,' : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.FEATURESMODULENAME}}', swHelper.isRouting() || modulesConfig.enabled ? os.EOL + '    FeaturesModule,' : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.NOTFOUNDMODULENAME}}', swHelper.isRouting() && modulesConfig.notFound.enabled ? os.EOL + '    NotFoundModule,' : '', [appModuleTsPath]);

  // replace in app.component.html
  const appComponentHtmlPath = path.join(projectPath, swConst.SRC, swConst.APP, 'app.component.html');
  const component = clientConfig.prefix + '-' + modulesConfig.features.defaultRoute;
  lightjs.replacement('{{PROJECT.NAVIGATION}}', os.EOL + (swHelper.isRouting() ? swConst.NAVIGATION : `  <${component}></${component}>`), [appComponentHtmlPath]);

  // replace in app.component.ts
  const appComponentTsPath = path.join(projectPath, swConst.SRC, swConst.APP, 'app.component.ts');
  lightjs.replacement('{{PROJECT.APPROUTINGMODULE}}', swHelper.isRouting() ? swConst.IMPORT_APP_ROUTING_MODULE + os.EOL : '', [appComponentTsPath]);
  lightjs.replacement('{{PROJECT.FEATURESROUTINGMODULE}}', swHelper.isRouting() ? swConst.IMPORT_FEATURES_ROUTING_MODULE + os.EOL : '', [appComponentTsPath]);
  lightjs.replacement('{{PROJECT.ROUTESMODULE}}', swHelper.isRouting() ? os.EOL + swConst.IMPORT_ANGULAR_ROUTER : '', [appComponentTsPath]);
  lightjs.replacement('{{PROJECT.ROUTESDECLARATION}}', swHelper.isRouting() ? os.EOL + os.EOL + swConst.ROUTES_DECLARATION : '', [appComponentTsPath]);
  lightjs.replacement('{{PROJECT.ROUTESALLOCATION}}', swHelper.isRouting() ? os.EOL + swConst.ROUTES_ALLOCATION : '', [appComponentTsPath]);
}

/**
 * Create a link for font files.
 *
 */
function createLink(font) {
  return `  <link href="https://fonts.googleapis.com/css2?family=${font}" rel="stylesheet">`;
}

/**
 * Update package.json file.
 *
 */
function updatePackageJsonFile() {
  const packageJsonFile = path.join(projectPath, swConst.PACKAGE_JSON);
  let packageJsonData = lightjs.readJson(packageJsonFile);
  const generalConfig = projectConfig.general;

  let scripts = {
    "build:dev": "ng lint && ng build --configuration=development",
    "serve:dev": "ng serve -o --configuration=development",
    "watch:dev": "ng build --watch --configuration=development",
  };
  if (swHelper.isMock()) {
    const mockScripts = {
      "build:mock": "ng lint && ng build --configuration=mock",
      "run:mock": "json-server mock/db.json --middlewares mock/middleware.js",
      "serve:mock": "ng serve -o --configuration=mock",
      "watch:mock": "ng build --watch --configuration=mock",
    };
    Object.assign(scripts, mockScripts);
  }
  Object.assign(scripts, { "build:prod": "ng lint && ng build" });

  let packageJsonTemplateData = {};
  const clientConfig = projectConfig.client;
  packageJsonTemplateData.author = generalConfig.author;
  packageJsonTemplateData.contributors = clientConfig.packageJson.contributors;
  packageJsonTemplateData.dependencies = packageJsonData.dependencies;
  packageJsonTemplateData.dependencies['@angular/cdk'] = swVersion.ANGULAR_CDK_MATERIAL;
  packageJsonTemplateData.dependencies['@angular/flex-layout'] = swVersion.ANGULAR_FLEX;
  packageJsonTemplateData.dependencies['@angular/material'] = swVersion.ANGULAR_CDK_MATERIAL;
  if (!swHelper.isRouting()) {
    packageJsonTemplateData.dependencies['@angular/router'] = undefined;
  }
  if (projectConfig.general.useSecurity) {
    packageJsonTemplateData.dependencies['@auth0/angular-jwt'] = swVersion.ANGULAR_JWT;
  }
  if (swHelper.isMock()) {
    packageJsonTemplateData.dependencies['json-server'] = swVersion.JSON_SERVER;
  }
  if (swHelper.isMock() || projectConfig.general.useSecurity) {
    packageJsonTemplateData.dependencies['jsonwebtoken'] = swVersion.JSONWEBTOKEN;
  }
  packageJsonTemplateData.description = generalConfig.description;
  packageJsonTemplateData.devDependencies = packageJsonData.devDependencies;
  if (swHelper.isPhp()) {
    packageJsonTemplateData.devDependencies['copy-webpack-plugin'] = swVersion.COPY_WEBPACK_PLUGIN;
    packageJsonTemplateData.devDependencies['@angular-builders/custom-webpack'] = swVersion.CUSTOM_WEBPACK;

    scripts['build:dev'] = updateTask(scripts, 'build:dev', 'dev');
    scripts['watch:dev'] = updateTask(scripts, 'watch:dev', 'dev');
    scripts['build:prod'] = updateTask(scripts, 'build:prod', 'prod');
    if (swHelper.isMock()) {
      scripts['build:mock'] = updateTask(scripts, 'build:mock', 'mock');
      scripts['watch:mock'] = updateTask(scripts, 'watch:mock', 'mock');
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
  packageJsonTemplateData.scripts = scripts;
  packageJsonTemplateData.version = '1.0.0-SNAPSHOT';

  lightjs.writeJson(packageJsonFile, packageJsonTemplateData);
  lightjs.replacement('$', os.EOL, [packageJsonFile]);
}

/**
 * Updates a task in package.json.
 *
 * @param {object} packageJsonData
 * @param {string} task
 * @param {mode} mode
 */
function updateTask(packageJsonData, task, mode) {
  return `export NODE_ENV='${mode}' && ${packageJsonData[task]}`;
}

/**
 * Installs dependencies.
 *
 */
function installDependencies() {
  lightjs.info('task: install dependencies');

  if (projectConfig.client.installDependencies) {
    lightjs.info('      option installDependencies is activated, install dependencies');
    const pwd = shjs.pwd();
    shjs.cd(projectPath);
    lightjs.setNpmDefault(!swHelper.isYarn());
    lightjs.yarnpm('install');
    shjs.cd(pwd);
  } else {
    lightjs.info('      option installDependencies is deactivated: nothing todo');
  }
}

/**
 * Updates dependencies.
 *
 * @param {string} pPath
 */
function updateDependencies(pPath) {
  if (shjs.which('ng')) {
    lightjs.info('update dependencies');
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
