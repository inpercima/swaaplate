'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swProjectConst = require('../root/project.const');
const swFrontendModule = require('./frontend-module');
const swHelper = require('../root/helper');
const swVersionConst = require('../root/version.const');

let exp = {};
let projectConfig = {};
let projectPath = '';

/**
 * Configure the frontend.
 *
 * @param {string} workspacePath
 * @param {object} pConfig
 * @param {string} pPath
 */
function configure(workspacePath, pConfig, pPath) {
  projectConfig = pConfig;
  projectPath = pPath;
  const frontendConfig = projectConfig.frontend;

  const pwd = shjs.pwd();
  const projectName = projectConfig.general.name;
  if (shjs.which('ng')) {
    shjs.cd(workspacePath);
    const params = [
      '--interactive=false --skip-install=true --style=css',
      `--package-manager=${swHelper.isYarn() ? swProjectConst.YARN : swProjectConst.NPM}`,
      `--directory=${projectName}`,
      `--prefix=${frontendConfig.prefix}`,
      `--routing=${swHelper.isRouting()}`
    ];
    lightjs.info(`run 'ng new ${projectName} ${params.join(" ")}'`);
    shjs.exec(`ng new ${projectName} ${params.join(" ")}`);

    shjs.cd(path.join(workspacePath, projectName));
    const schematicCypress = `ng add @cypress/schematic@${swVersionConst.CYPRESS_SCHEMATIC} --skip-confirmation=true`;
    lightjs.info(`run '${schematicCypress}'`);
    shjs.exec(`${schematicCypress}`);
    const schematicEsLint = `ng add @angular-eslint/schematics@${swVersionConst.ANGULAR_ESLINT_SCHEMATICS} --skip-confirmation=true`;
    lightjs.info(`run '${schematicEsLint}'`);
    shjs.exec(`${schematicEsLint}`);
  } else {
    lightjs.error(`sorry, this script requires 'ng'`);
    shjs.exit(1);
  }
  shjs.cd(pwd);

  swFrontendModule.generateModulesAndComponents(projectConfig, projectPath);
  copyFiles();
  prepareMock();
  updateAngularJsonFile();
  createEnvironmentTsFiles();
  replaceSectionsInFiles();
  replaceTemplatesInFiles();
  updateTsConfigJsonFile();
  updatePackageJsonFile();
  if (frontendConfig.useGoogleFonts) {
    addGoogleFonts();
  }
  installDependencies();
}

/**
 * Copy frontend files.
 *
 */
function copyFiles() {
  lightjs.info('task: copy frontend files');

  const srcPath = path.join(projectPath, swProjectConst.SRC);
  shjs.cp(path.join(swProjectConst.SRC_TEMPLATE_FRONTEND, 'src/favicon.ico'), srcPath);
  shjs.cp(path.join(swProjectConst.SRC_TEMPLATE_FRONTEND, 'src/themes.scss'), srcPath);

  const generalConfig = projectConfig.general;
  if (projectConfig.general.useSecurity) {
    lightjs.info('      option useSecurity is activated: copy authentication files');
    const corePath = path.join(srcPath, swProjectConst.APP, swProjectConst.CORE);
    shjs.mkdir(corePath);
    shjs.cp('-r', path.join(swProjectConst.SRC_TEMPLATE_FRONTEND, swProjectConst.SRC, swProjectConst.CORE, '*'), corePath);
  } else {
    lightjs.info('      option useSecurity is deactivated: nothing todo');
  }

  if (generalConfig.modRewriteIndex) {
    shjs.cp(path.join(swProjectConst.SRC_TEMPLATE_FRONTEND, 'src/.htaccess'), srcPath);
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

    const mockPath = path.join(projectPath, swProjectConst.MOCK);
    shjs.mkdir(mockPath);
    shjs.cp(path.join(swProjectConst.SRC_TEMPLATE_FRONTEND, swProjectConst.MOCK, 'middleware.js'), mockPath);

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
  const angularJsonFile = path.join(projectPath, swProjectConst.ANGULAR_JSON);
  let angularJsonData = lightjs.readJson(angularJsonFile);
  const generalConfig = projectConfig.general;
  const name = generalConfig.name;
  const frontendConfig = projectConfig.frontend;
  const architectData = angularJsonData.projects[name].architect;
  architectData.build.options.outputPath = frontendConfig.buildDir;
  architectData.build.options.styles.push('src/themes.scss');
  architectData.build.configurations.production.fileReplacements = addFileReplacements('prod');
  architectData.build.configurations.development.budgets = addBudgets();
  architectData.build.configurations.development.fileReplacements = addFileReplacements('dev');
  if (swHelper.isMock()) {
    architectData.build.configurations.mock = addFileReplacementsAndBudgets('mock');
  }
  if (swHelper.isMock()) {
    architectData.serve.configurations.mock = addBrowserTarget(name, 'mock');
  }

  if (generalConfig.modRewriteIndex || swHelper.isPhp()) {
    const assets = architectData.build.options.assets;
    if (generalConfig.modRewriteIndex) {
      assets.unshift("src/.htaccess");
    }
    if (swHelper.isPhp()) {
      const backendFolder = swHelper.getBackendFolder();
      const assetsPhp = {
        "glob": "**/*",
        "ignore": ["**/config.default.php", "**/config.dev.php", "**/README.md"],
        "input": "../" + backendFolder + "/",
        "output": "/" + backendFolder + "/"
      };
      assets.push(assetsPhp);
    }

    architectData.build.options.assets = assets;
  }

  /**
   * For production also add namedChunks and vendorChunk.
   */
  architectData.build.configurations.production.namedChunks = true;
  architectData.build.configurations.production.vendorChunk = true;
  angularJsonData.projects[name].architect = architectData;
  lightjs.writeJson(angularJsonFile, angularJsonData);
  lightjs.replacement('$', os.EOL, [path.join(projectPath, swProjectConst.ANGULAR_JSON)]);
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
function createEnvironmentTsFiles() {
  const environmentsPath = path.join(projectPath, swProjectConst.SRC, 'environments');
  shjs.mkdir(environmentsPath);

  createEnvironmentTsFile(path.join(environmentsPath, swProjectConst.ENVIRONMENT_TS), false);
  createEnvironmentTsFile(path.join(environmentsPath, swProjectConst.ENVIRONMENT_DEV_TS), false);
  if (swHelper.isMock()) {
    createEnvironmentTsFile(path.join(environmentsPath, swProjectConst.ENVIRONMENT_MOCK_TS), false);
  }
  createEnvironmentTsFile(path.join(environmentsPath, swProjectConst.ENVIRONMENT_PROD_TS), true);
}

function createEnvironmentTsFile(environmentTsFile, production) {
  const frontendConfig = projectConfig.frontend;
  const modulesConfig = frontendConfig.modules;
  const generalConfig = projectConfig.general;
  const backendConfig = projectConfig.backend;
  const api = swHelper.isJavaKotlin() ? 'http://localhost:8080/' : (swHelper.isPhp() && backendConfig.php.runAsApi ? './api/' : './');

  const environments = `export const environment = {
  api: '${api}',
  appname: '${generalConfig.title}',
  defaultRoute: '${modulesConfig.features.defaultRoute}',
  production: ${production},
  theme: '${frontendConfig.theme}',
};`;
  lightjs.writeFile(environmentTsFile, environments);
}

/**
 * Remove trailing whitespaces, double line breaks, EOL and replace specific text sections they should be changed.
 *
 */
function replaceSectionsInFiles() {
  const generalConfig = projectConfig.general;
  // replace in cypress/
  const cypress = path.join(projectPath, swProjectConst.CYPRESS);
  const cypressE2eSpec = path.join(cypress, 'e2e', 'spec.cy.ts');
  lightjs.replacement(`(cy\\.visit\\('\\/'\\))\\n    cy\\.contains\\('Welcome'\\)\\n    `, `$1${os.EOL}    `, [cypressE2eSpec]);
  lightjs.replacement('app is running!', generalConfig.title, [cypressE2eSpec]);

  const frontendConfig = projectConfig.frontend;
  const srcPath = path.join(projectPath, swProjectConst.SRC);
  // replace in index.html
  const indexHtmlPath = path.join(srcPath, swProjectConst.INDEX_HTML);
  lightjs.replacement('(lang=")en', `$1${frontendConfig.language}`, [indexHtmlPath]);
  lightjs.replacement('  <title>.*<\/title>', swProjectConst.EMPTY, [indexHtmlPath]);
  lightjs.replacement('<body>', '<body class="mat-typography mat-app-background">');
  lightjs.replacement(swProjectConst.EOL_EXPRESSION, os.EOL, [indexHtmlPath]);

  const prefix = frontendConfig.prefix;
  lightjs.replacement(`(<${prefix}-root>)(</${prefix}-root>)`, '$1Loading...$2', [indexHtmlPath]);

  // replace in app.component.spec.ts
  const tabsImport = swHelper.isRouting() ? `${swProjectConst.IMPORT_MATERIAL_TABS_MODULE}${os.EOL}` : '';
  const toolbarImport = `import { MatToolbarModule } from '@angular/material/toolbar';`;
  const pipeImport = swHelper.isRouting() ? os.EOL + swProjectConst.IMPORT_APP_ROUTING_PIPE : '';
  const specPath = path.join(projectPath, swProjectConst.SRC, swProjectConst.APP, 'app.component.spec.ts');
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
  lightjs.replacement(swProjectConst.APP_RUNNING, swProjectConst.EMPTY, [specPath]);
  lightjs.replacement(swProjectConst.CONTENT_SPAN, swProjectConst.CONTENT_SPAN_REP, [specPath]);
  lightjs.replacement('(as )title', '$1appname', [specPath]);
  lightjs.replacement('(app.)title', '$1appname', [specPath]);
  lightjs.replacement('(render )title', '$1toolbar', [specPath]);

  // misc
  let googleFonts = frontendConfig.useGoogleFonts ? `${os.EOL}@import 'fonts.css';${os.EOL}` : os.EOL;
  lightjs.replacement(swProjectConst.EOL, `@import 'app/app.component.css';${googleFonts}`, [path.join(projectPath, swProjectConst.SRC, 'styles.css')]);
}

/**
 * Replace templates in template files.
 *
 */
function replaceTemplatesInFiles() {
  // replace in app.module.ts
  const appModuleTsPath = path.join(projectPath, swProjectConst.SRC, swProjectConst.APP, 'app.module.ts');
  const frontendConfig = projectConfig.frontend;
  const modulesConfig = frontendConfig.modules;
  lightjs.replacement('{{PROJECT.MATERIALTABSMODULE}}', swHelper.isRouting() ? os.EOL + swProjectConst.IMPORT_MATERIAL_TABS_MODULE : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.APPROUTING}}', swHelper.isRouting() ? os.EOL + swProjectConst.IMPORT_APP_ROUTING_MODULE + os.EOL + swProjectConst.IMPORT_APP_ROUTING_PIPE : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.FEATURESMODULE}}', swHelper.isRouting() || modulesConfig.enabled ? os.EOL + swProjectConst.IMPORT_FEATURES_MODULE : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.NOTFOUNDMODULE}}', swHelper.isRouting() && modulesConfig.notFound.enabled ? os.EOL + swProjectConst.IMPORT_NOT_FOUND_MODULE : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.APPROUTINGPIPENAME}}', swHelper.isRouting() ? os.EOL + '    AppRoutingPipe,' : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.MATERIALTABSMODULENAME}}', swHelper.isRouting() ? os.EOL + '    MatTabsModule,' : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.APPROUTINGMODULENAME}}', swHelper.isRouting() ? os.EOL + '    AppRoutingModule,' : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.FEATURESMODULENAME}}', swHelper.isRouting() || modulesConfig.enabled ? os.EOL + '    FeaturesModule,' : '', [appModuleTsPath]);
  lightjs.replacement('{{PROJECT.NOTFOUNDMODULENAME}}', swHelper.isRouting() && modulesConfig.notFound.enabled ? os.EOL + '    NotFoundModule,' : '', [appModuleTsPath]);

  // replace in app.component.html
  const appComponentHtmlPath = path.join(projectPath, swProjectConst.SRC, swProjectConst.APP, 'app.component.html');
  const component = frontendConfig.prefix + '-' + modulesConfig.features.defaultRoute;
  lightjs.replacement('{{PROJECT.NAVIGATION}}', os.EOL + (swHelper.isRouting() ? swProjectConst.NAVIGATION : `  <${component}></${component}>`), [appComponentHtmlPath]);

  // replace in app.component.ts
  const appComponentTsPath = path.join(projectPath, swProjectConst.SRC, swProjectConst.APP, 'app.component.ts');
  lightjs.replacement('{{PROJECT.APPROUTINGMODULE}}', swHelper.isRouting() ? swProjectConst.IMPORT_APP_ROUTING_MODULE + os.EOL : '', [appComponentTsPath]);
  lightjs.replacement('{{PROJECT.FEATURESROUTINGMODULE}}', swHelper.isRouting() ? swProjectConst.IMPORT_FEATURES_ROUTING_MODULE + os.EOL : '', [appComponentTsPath]);
  lightjs.replacement('{{PROJECT.ROUTESMODULE}}', swHelper.isRouting() ? os.EOL + swProjectConst.IMPORT_ANGULAR_ROUTER : '', [appComponentTsPath]);
  lightjs.replacement('{{PROJECT.ROUTESDECLARATION}}', swHelper.isRouting() ? os.EOL + os.EOL + swProjectConst.ROUTES_DECLARATION : '', [appComponentTsPath]);
  lightjs.replacement('{{PROJECT.ROUTESALLOCATION}}', swHelper.isRouting() ? os.EOL + swProjectConst.ROUTES_ALLOCATION : '', [appComponentTsPath]);
}

/**
 * Updates tsconfig.json file.
 * 
 * This fix Cypress causing type errors in assertions.
 * Check: https://stackoverflow.com/questions/58999086/cypress-causing-type-errors-in-jest-assertions
 * Answer: https://stackoverflow.com/a/61839618
 */
function updateTsConfigJsonFile() {
  const tsConfigJsonFile = path.join(projectPath, 'tsconfig.json');
  const include = `  },
  "include": [
    "src/**/*"
  ]
}`;
  lightjs.replacement('  }\\r?\\n\\s*}', include, [tsConfigJsonFile]);
}

/**
 * Update package.json file.
 *
 */
function updatePackageJsonFile() {
  const packageJsonFile = path.join(projectPath, swProjectConst.PACKAGE_JSON);
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
  const frontendConfig = projectConfig.frontend;
  packageJsonTemplateData.author = generalConfig.author;
  packageJsonTemplateData.contributors = frontendConfig.packageJson.contributors;
  packageJsonTemplateData.dependencies = packageJsonData.dependencies;
  packageJsonTemplateData.dependencies['@angular/cdk'] = swVersionConst.ANGULAR_CDK_MATERIAL;
  packageJsonTemplateData.dependencies['@angular/material'] = swVersionConst.ANGULAR_CDK_MATERIAL;
  if (frontendConfig.useGoogleFonts) {
    packageJsonTemplateData.dependencies['material-icons'] = swVersionConst.MATERIAL_ICONS;
  }
  if (!swHelper.isRouting()) {
    packageJsonTemplateData.dependencies['@angular/router'] = undefined;
  }
  if (generalConfig.useSecurity) {
    packageJsonTemplateData.dependencies['@auth0/angular-jwt'] = swVersionConst.ANGULAR_JWT;
  }
  if (swHelper.isMock()) {
    packageJsonTemplateData.dependencies['json-server'] = swVersionConst.JSON_SERVER;
  }
  if (swHelper.isMock() || generalConfig.useSecurity) {
    packageJsonTemplateData.dependencies['jsonwebtoken'] = swVersionConst.JSONWEBTOKEN;
  }
  packageJsonTemplateData.description = generalConfig.description;
  packageJsonTemplateData.devDependencies = packageJsonData.devDependencies;
  if (swHelper.isPhp()) {
    scripts['build:dev'] = updateTask(scripts, 'build:dev');
    scripts['watch:dev'] = updateTask(scripts, 'watch:dev');
    scripts['build:prod'] = updateTask(scripts, 'build:prod');
    if (swHelper.isMock()) {
      scripts['build:mock'] = updateTask(scripts, 'build:mock');
      scripts['watch:mock'] = updateTask(scripts, 'watch:mock');
    }
  }
  packageJsonTemplateData.engines = {
    node: '>=' + swVersionConst.NODE,
  };
  packageJsonTemplateData.homepage = frontendConfig.packageJson.homepage;
  if (generalConfig.useMITLicense) {
    packageJsonTemplateData.license = 'MIT';
  }
  packageJsonTemplateData.name = generalConfig.name;
  packageJsonTemplateData.private = true;
  packageJsonTemplateData.repository = frontendConfig.packageJson.repository;
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
 */
function updateTask(packageJsonData, task) {
  return `${packageJsonData[task]}`;
}

/**
 * Add Google Fonts locally.
 *
 */
function addGoogleFonts() {
  shjs.cp(path.join(swProjectConst.SRC_TEMPLATE_FRONTEND, 'fonts.css'), path.join(projectPath, swProjectConst.SRC));
  shjs.cp('-r', swProjectConst.SRC_TEMPLATE_FRONTEND_FONTS, path.join(projectPath, swProjectConst.SRC_ASSETS));
  shjs.rm(path.join(projectPath, swProjectConst.SRC_ASSETS, '.gitkeep'));
}

/**
 * Installs dependencies.
 *
 */
function installDependencies() {
  lightjs.info('task: install dependencies');

  if (projectConfig.frontend.installDependencies) {
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
    if (swHelper.isNone()) {
      shjs.cd(pPath);
    }
    else {
      shjs.cd(path.join(pPath, swProjectConst.FRONTEND));
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
