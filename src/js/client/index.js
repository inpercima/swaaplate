'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swClientModule = require('./module.js');
const swConst = require('../const.js');

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
  const name = projectConfig.general.name;
  if (shjs.which('ng')) {
    shjs.cd(workspacePath);
    const packageManager = clientConfig.useYarn ? swConst.YARN : swConst.NPM;
    const paramsDirStyPack = `--directory=${name} --style=css --packageManager=${packageManager}`;
    const paramsPreRout = `--prefix=${clientConfig.prefix} --routing=${clientConfig.routing.enabled}`;

    lightjs.info(`run 'ng new ${name} --interactive=false --skipInstall=true ${paramsDirStyPack} ${paramsPreRout}'`);
    shjs.exec(`ng new ${name} --interactive=false --skipInstall=true ${paramsDirStyPack} ${paramsPreRout}`);
  } else {
    lightjs.error(`sorry, this script requires 'ng'`);
    shjs.exit(1);
  }
  shjs.cd(pwd);

  swClientModule.generateModulesAndComponents(projectConfig, projectPath);
  copyFiles();
  updateAngularJsonFile();
  updateEnvironmentTsFiles();
  replaceSectionsInFiles();
  updatePackageJsonFile();
  installDependencies();
  updateDependencies();
}

/**
 * Copy files.
 *
 */
function copyFiles() {
  lightjs.info('copy client files');

  const templatePath = 'src/template/client/';

  const mockFolder = 'mock';
  const mockPath = path.join(projectPath, mockFolder);
  shjs.mkdir(mockPath);
  shjs.cp(path.join(templatePath, mockFolder, '*'), mockPath);

  const srcPath = path.join(projectPath, swConst.SRC);
  shjs.cp(path.join(templatePath, 'src/favicon.ico'), srcPath);
  shjs.cp(path.join(templatePath, 'src/themes.scss'), srcPath);

  shjs.cp('src/template/package.json', projectPath);

  const coreFolder = 'core';
  const corePath = path.join(srcPath, swConst.APP, coreFolder);
  shjs.mkdir(corePath);
  shjs.cp('-r', path.join(templatePath, swConst.SRC, coreFolder, '*'), corePath);
}

/**
 * Update angular.json file.
 *
 */
function updateAngularJsonFile() {
  const angularJsonFile = path.join(projectPath, swConst.ANGULAR_JSON);
  let angularJsonData = lightjs.readJson(angularJsonFile);
  const name = projectConfig.general.name;
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
  architectData.build.configurations.mock = addFileReplacementsAndBudgets('mock');
  architectData.serve.configurations.dev = addBrowserTarget(name, 'dev');
  architectData.serve.configurations.mock = addBrowserTarget(name, 'mock');
  architectData.build.configurations.production.namedChunks = true;
  architectData.build.configurations.production.vendorChunk = true;
  angularJsonData.projects[projectConfig.general.name].architect = architectData;
  lightjs.writeJson(angularJsonFile, angularJsonData);
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
  const api = serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN ? 'http://localhost:8080/' : './';
  const apiSuffix = serverConfig.backend === swConst.PHP ? '.php' : '';
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
  shjs.cp(path.join(environmentsPath, swConst.ENVIRONMENT_TS), path.join(environmentsPath, swConst.ENVIRONMENT_MOCK_TS));
  shjs.cp(path.join(environmentsPath, swConst.ENVIRONMENT_TS), path.join(environmentsPath, swConst.ENVIRONMENT_PROD_TS));

  lightjs.replacement('(production: )false', `$1true`, [path.join(environmentsPath, swConst.ENVIRONMENT_PROD_TS)]);
  replaceCommentsInEnvironmentTsFile(environmentsPath, swConst.ENVIRONMENT_DEV_TS);
  replaceCommentsInEnvironmentTsFile(environmentsPath, swConst.ENVIRONMENT_MOCK_TS);
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
  // replace in e2e/
  lightjs.replacement('welcome message', 'title in toolbar', [path.join(projectPath, 'e2e', swConst.SRC, swConst.APP_E2E_SPEC_TS)]);
  lightjs.replacement(' app is running!', '', [path.join(projectPath, 'e2e', swConst.SRC, swConst.APP_E2E_SPEC_TS)]);
  lightjs.replacement('.content span', 'mat-toolbar', [path.join(projectPath, 'e2e', swConst.SRC, swConst.APP_PO_TS)]);
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

  // replace in styles.css
  lightjs.replacement('$', `@import 'app/app.component.css';\n`, [path.join(projectPath, swConst.SRC, swConst.STYLES_CSS)]);

  // misc
  lightjs.replacement('$', os.EOL, [path.join(projectPath, swConst.TSLINT_JSON)]);
  lightjs.replacement('$', os.EOL, [path.join(projectPath, swConst.ANGULAR_JSON)]);
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
  const templatePath = 'src/template/client/';
  const packageJsonTemplateFile = path.join(templatePath, swConst.PACKAGE_JSON);
  let packageJsonTemplateData = lightjs.readJson(packageJsonTemplateFile);
  const packageJsonFile = path.join(projectPath, swConst.PACKAGE_JSON);
  let packageJsonData = lightjs.readJson(packageJsonFile);

  const clientConfig = projectConfig.client;
  const generalConfig = projectConfig.general;
  packageJsonTemplateData.author = generalConfig.author;
  packageJsonTemplateData.description = generalConfig.description;
  packageJsonTemplateData.name = generalConfig.name;
  packageJsonTemplateData.contributors = clientConfig.packageJson.contributors;
  packageJsonTemplateData.homepage = clientConfig.packageJson.homepage;
  packageJsonTemplateData.repository = clientConfig.packageJson.repository;
  packageJsonTemplateData.contributors = clientConfig.packageJson.contributors;
  if (generalConfig.useMITLicense) {
    packageJsonTemplateData.license = 'MIT';
  }
  packageJsonTemplateData.version = swConst.PROJECT_VERSION;
  packageJsonTemplateData.dependencies = packageJsonData.dependencies;
  packageJsonTemplateData.dependencies['@angular/cdk'] = '~9.0.1',
  packageJsonTemplateData.dependencies['@angular/flex-layout'] = '~9.0.0-beta.29',
  packageJsonTemplateData.dependencies['@angular/material'] = '~9.0.1',
  packageJsonTemplateData.dependencies['@auth0/angular-jwt'] = '~3.0.1',
  packageJsonTemplateData.dependencies['json-server'] = '~0.15.1',
  packageJsonTemplateData.dependencies['jsonwebtoken'] = '~8.5.1',
  packageJsonTemplateData.devDependencies = packageJsonData.devDependencies;

  const serverConfig = projectConfig.server;
  if (serverConfig.backend === swConst.PHP) {
    packageJsonTemplateData.devDependencies['copy-webpack-plugin'] = swConst.COPY_WEBPACK_PLUGIN;
    packageJsonTemplateData.devDependencies['@angular-builders/custom-webpack'] = swConst.ANGULAR_BUILDERS;
    packageJsonTemplateData.scripts['build:mock'] = updateTask(packageJsonTemplateData, 'build:mock');
    packageJsonTemplateData.scripts['watch:mock'] = updateTask(packageJsonTemplateData, 'watch:mock');
  }

  if (serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN) {
    packageJsonTemplateData.scripts['serve:dev'] = 'ng serve -o --configuration=dev';
  }
  lightjs.writeJson(packageJsonFile, packageJsonTemplateData);
}

/**
 * Updates a task in package.json.
 *
 * @param {object} packageJsonData
 * @param {string} mockTask
 */
function updateTask(packageJsonData, mockTask) {
  return `export NODE_ENV='mock' && ${packageJsonData.scripts[mockTask]}`;
}

/**
 * Install dependencies.
 *
 */
function installDependencies() {
  lightjs.info('install dependencies');

  if (projectConfig.client.installDependencies) {
    const pwd = shjs.pwd();
    shjs.cd(projectPath);
    lightjs.setNpmDefault = !projectConfig.client.useYarn;
    lightjs.yarnpm('install');
    shjs.cd(pwd);
  } else {
    lightjs.info('no dependencies will be installed');
  }
}

/**
 * Update the dependencies for the client.
 *
 * @param {object} clientConfig
 * @param {string} backend
 * @param {string} projectPath
 */
function updateDependencies(clientConfig, backend, projectPath) {
  // if (clientConfig.installDependencies) {
  //   if (backend !== swConst.JS) {
  //     shjs.cd(path.join(projectPath, swConst.CLIENT));
  //   } else {
  //     shjs.cd(projectPath);
  //   }
  //   if (shjs.which('ng')) {
  //     shjs.exec('ng update --all --allowDirty=true --force=true');
  //   } else {
  //     lightjs.error(`sorry, this script requires 'ng'`);
  //     shjs.exit(1);
  //   }
  // } else {
  //   lightjs.info('no dependencies will be installed');
  // }
}

/**
 * Updates the client readme file.
 *
 * @param {object} config
 * @param {object} projectPath
 */
function updateReadmeFile(config, projectPath) {
  const readmeMd = path.join(projectPath, swConst.CLIENT, swConst.README_MD);
  lightjs.info(`update '${readmeMd}'`);

  const generalConfig = config.general;
  const projectName = generalConfig.name;
  lightjs.replacement(swConst.SW_TITLE, projectName, [readmeMd]);

  // replace first part whic is in main readme
  lightjs.replacement(`${swConst.THIS_PROJECT}(.|\n)*(## Getting started)`, '$2', [readmeMd]);

  // replace license logo
  lightjs.replacement('\\[!\\[MIT.*\\s', '', [readmeMd]);
  lightjs.replacement('(status.svg)', '$1?path=client', [readmeMd]);
  lightjs.replacement(`(/${generalConfig.name})\\)`, '$1?path=client)', [readmeMd]);
  lightjs.replacement('\\?(type=dev)', '?path=client&$1', [readmeMd]);

  lightjs.replacement('# clone project', `# all commands used in ./${swConst.CLIENT}`, [readmeMd]);
  lightjs.replacement(`${swConst.GIT_CLONE}\\s(cd).*`, `$3 ${swConst.CLIENT}`, [readmeMd]);

  const clientConfig = config.client;
  if (!clientConfig.useYarn) {
    // replace yarn with npm in getting started section
    lightjs.replacement('(dependencies\\s)(yarn)', `$1npm install`, [readmeMd]);

    // replace all other occurrences of yarn with npm
    lightjs.replacement('yarn (.*:)', `npm run $1`, [readmeMd]);
  }

  const theme = clientConfig.theme;
  if (theme !== swConst.THEME) {
    lightjs.replacement(`(${swConst.DEFAULT}: )\`${swConst.THEME}\``, `$1\`${theme}\``, [readmeMd]);
  }

  const defaultRoute = clientConfig.routing.features.default;
  if (defaultRoute !== swConst.DASHBOARD) {
    lightjs.replacement(`\`${swConst.DASHBOARD}\``, `\`${defaultRoute}\``, [readmeMd]);
  }

  lightjs.replacement(`(# ${projectName})`, `$1 - ${swConst.CLIENT}`, [readmeMd]);

  const backend = config.server.backend;
  if (backend === swConst.JAVA || backend === swConst.KOTLIN) {
    lightjs.replacement(`(${swConst.DEFAULT}: )\`./\``, `$1\`http://localhost:8080/\``, [readmeMd]);
  }

  if (backend === swConst.PHP) {
    if (!config.server.htaccess) {
      lightjs.replacement(`(${swConst.DEFAULT}: )EMPTY`, `$1\`.php\``, [readmeMd]);
    }

    if (config.server.serverAsApi) {
      lightjs.replacement(`(${swConst.DEFAULT}: )\`./\``, `$1\`./api/\``, [readmeMd]);
    }
  }
}

exp.configure = configure;
exp.updateDependencies = updateDependencies;

module.exports = exp;
