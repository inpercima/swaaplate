'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const request = require('request');
const shjs = require('shelljs');

const swcomponent = require('./swaaplate.component.js');
const swendpoint = require('./swaaplate.endpoint.js');
const swmanagement = require('./swaaplate.management.js');

let core = {};

/**
 * Creates the project for the specific endpoint.
 *
 * @param {object} swaaplateJsonData
 */
function createProject(swaaplateJsonData) {
  const projectName = swaaplateJsonData.packageJsonConfig.name;
  const outputDir = swaaplateJsonData.generalConfig.outputDir;
  const projectDir = outputDir + projectName;
  lightjs.info(`create project '${projectName}' in '${outputDir}'`);

  shjs.mkdir('-p', projectDir);
  shjs.cp('-r', 'node_modules/angular-cli-for-swaaplate/*', projectDir);
  shjs.cp('-r', 'node_modules/angular-cli-for-swaaplate/.editorconfig', projectDir);
  shjs.cp('-r', 'node_modules/angular-cli-for-swaaplate/.gitattributes', projectDir);
  shjs.cp('-r', 'node_modules/angular-cli-for-swaaplate/.gitignore', projectDir);
  shjs.cp('swaaplate.json', path.join(projectDir, 'swaaplate-backup.json'));
  shjs.rm(path.join(projectDir, 'yarn.lock'));

  updatePackageJsonData(swaaplateJsonData, projectDir);
  updateConfigJsonData(swaaplateJsonData, projectDir);
  updateGeneralProjectData(swaaplateJsonData, projectDir);
  updateGitignore(swaaplateJsonData, projectDir);

  swendpoint.configureEndpoint(swaaplateJsonData, projectDir);
  swmanagement.configureManagement(swaaplateJsonData, projectDir);
  swcomponent.configureComponents(swaaplateJsonData, projectDir);

  installDependencies(swaaplateJsonData, projectDir);
}

function updatePackageJsonData(swaaplateJsonData, projectDir) {
  const packageJson = path.join(projectDir, 'package.json');
  lightjs.info(`update '${packageJson}'`);

  const packageJsonData = lightjs.readJson(packageJson);
  const config = swaaplateJsonData.packageJsonConfig;
  packageJsonData.author = config.author;
  packageJsonData.contributors = config.contributors;
  packageJsonData.description = config.description;
  packageJsonData.name = config.name;

  const github = swaaplateJsonData.generalConfig.github;
  packageJsonData.repository = github.use ? `https://github.com/${github.username}/${config.name}` : config.repository;
  if (swaaplateJsonData.serverConfig.endpoint === 'php') {
    packageJsonData.devDependencies['copy-webpack-plugin'] = '4.5.4';
  }

  if (config.homepage === '' && packageJsonData.repository !== '') {
    packageJsonData.homepage = packageJsonData.repository;
  } else {
    packageJsonData.homepage = config.homepage;
  }

  packageJsonData.version = '0.0.1-SNAPSHOT';
  lightjs.writeJson(packageJson, packageJsonData);
}

function updateConfigJsonData(swaaplateJsonData, projectDir) {
  const configDefaultJson = path.join(projectDir, 'src/config.default.json');
  lightjs.info(`update '${configDefaultJson}'`);

  const configDefaultJsonData = lightjs.readJson(configDefaultJson);
  configDefaultJsonData.appname = swaaplateJsonData.generalConfig.title;
  configDefaultJsonData.routes.default = swaaplateJsonData.routeConfig.default;
  configDefaultJsonData.routes.features.show = swaaplateJsonData.routeConfig.features.show;
  configDefaultJsonData.routes.login.activate = swaaplateJsonData.routeConfig.login.activate;
  configDefaultJsonData.routes.login.show = swaaplateJsonData.routeConfig.login.show;
  configDefaultJsonData.routes.notFound.redirect = swaaplateJsonData.routeConfig.notFound.redirect;
  configDefaultJsonData.theme = swaaplateJsonData.generalConfig.theme;
  lightjs.writeJson(configDefaultJson, configDefaultJsonData);

  const configJson = path.join(projectDir, 'src/config.json');
  lightjs.info(`create '${configJson}'`);
  shjs.cp(configDefaultJson, configJson);
}

function updateGeneralProjectData(swaaplateJsonData, projectDir) {
  const gitignore = path.join(projectDir, '.gitignore');
  lightjs.info(`update '${gitignore}', 'LICENSE.md', 'app.component.spec.ts' and 'app.e2e-spec.ts'`);

  lightjs.replacement('(config.json)', `$1${os.EOL}swaaplate-backup.json`, [gitignore]);
  const buildWebDir = swaaplateJsonData.generalConfig.buildWebDir;
  const distDir = 'dist';
  if (buildWebDir !== distDir) {
    lightjs.replacement('(backup.json)', `$1${os.EOL}/${buildWebDir}`, [gitignore]);
  }

  const author = swaaplateJsonData.packageJsonConfig.author;
  const authorMj = 'Marcel Jänicke';
  if (author !== authorMj) {
    lightjs.replacement(authorMj, author, [path.join(projectDir, 'LICENSE.md')]);
  }

  const oldTitle = 'angular-cli-for-swaaplate';
  if (swaaplateJsonData.generalConfig.title !== oldTitle) {
    lightjs.replacement(oldTitle, swaaplateJsonData.generalConfig.title, [path.join(projectDir, 'e2e/src', 'app.e2e-spec.ts')]);
    lightjs.replacement(oldTitle, swaaplateJsonData.generalConfig.title, [path.join(projectDir, 'src/app', 'app.component.spec.ts')]);
  }

  replaceInReadme(swaaplateJsonData, projectDir);
  replaceInAngularJson(swaaplateJsonData, projectDir);
}

function replaceInReadme(swaaplateJsonData, projectDir) {
  const readme = 'README.md';
  lightjs.info(`update '${path.join(projectDir, readme)}'`);

  const packageJsonConfig = swaaplateJsonData.packageJsonConfig;
  const name = packageJsonConfig.name;
  const readmePath = path.join(projectDir, readme);
  lightjs.replacement('angular-cli-for-swaaplate', name, [readmePath]);
  lightjs.replacement('(git clone )(.+)', `$1${packageJsonConfig.repository}`, [readmePath]);

  const generated = 'This project was generated with [swaaplate](https://github.com/inpercima/swaaplate).';
  const description = `${packageJsonConfig.description}${os.EOL}${os.EOL}${generated}`;
  lightjs.replacement('This.+projects.\\s*', '', [readmePath]);
  lightjs.replacement('This project.+', description, [readmePath]);

  const generalConfig = swaaplateJsonData.generalConfig;
  const github = generalConfig.github;
  if (github.use) {
    lightjs.replacement('(org\\/)(inpercima)', `$1${github.username}`, [readmePath]);
    lightjs.replacement('(\\/)(angular-cli-for-swaaplate)(\\/|\\?|\\))', `$1${name}$3`, [readmePath]);
  } else {
    lightjs.replacement('\\[!\\[dependencies.*\\s\\[.*\\s', '', [readmePath]);
  }

  if (!generalConfig.useYarn) {
    lightjs.replacement('or higher,.*', 'or higher', [readmePath]);
    lightjs.replacement('or higher or', 'or higher, used in this repository, or', [readmePath]);
    lightjs.replacement('yarn run', 'npm run', [readmePath]);
    lightjs.replacement('(dependencies\\s)(yarn)', `$1npm install`, [readmePath]);
  }

  if (generalConfig.theme !== 'indigo-pink') {
    lightjs.replacement('(default: )`indigo-pink`', `$1\`${generalConfig.theme}\``, [readmePath]);
  }

  const defaultRoute = swaaplateJsonData.routeConfig.default;
  if (defaultRoute !== 'dashboard') {
    lightjs.replacement('`dashboard`', `\`${defaultRoute}\``, [readmePath]);
  }

  const endpoint = swaaplateJsonData.serverConfig.endpoint;
  if (endpoint === 'java' || endpoint === 'kotlin') {
    lightjs.replacement('(## Usage\\s)', `$1${os.EOL}TODO: Update usage for ${endpoint}${os.EOL}`, [readmePath]);
  }
}

function replaceInAngularJson(swaaplateJsonData, projectDir) {
  const angularJson = 'angular.json';
  lightjs.info(`update '${path.join(projectDir, angularJson)}'`);

  const packageJsonConfig = swaaplateJsonData.packageJsonConfig;
  const name = packageJsonConfig.name;
  const angularJsonPath = path.join(projectDir, angularJson);
  lightjs.replacement('angular-cli-for-swaaplate', name, [angularJsonPath]);

  const generalConfig = swaaplateJsonData.generalConfig;
  if (generalConfig.buildWebDir !== 'dist') {
    lightjs.replacement('"dist"', `"${generalConfig.buildWebDir}"`, [angularJsonPath]);
  }

  if (generalConfig.theme !== 'indigo-pink') {
    lightjs.replacement('indigo-pink', generalConfig.theme, [angularJsonPath]);
  }

  if (generalConfig.selectorPrefix !== 'app') {
    lightjs.replacement('"app"', `"${generalConfig.selectorPrefix}"`, [angularJsonPath]);
  }

  const serverConfig = swaaplateJsonData.serverConfig;
  if (serverConfig.endpoint !== 'js') {
    lightjs.replacement('(src/)', `$1web/`, [angularJsonPath]);
    lightjs.replacement('"(src)"', `"$1/web"`, [angularJsonPath]);
  }
}

function updateGitignore(swaaplateJsonData, projectDir) {
  const endpoint = swaaplateJsonData.serverConfig.endpoint;
  if (endpoint === 'java' || endpoint === 'kotlin') {
    const management = swaaplateJsonData.serverConfig.management;
    const managementApi = management === 'maven' || management === 'gradle' ? `${management},` : '';
    const gitignore = path.join(projectDir, '.gitignore');
    const api = `https://www.gitignore.io/api/angular,node,${endpoint},${managementApi}eclipse,intellij+all,visualstudiocode`;
    request(api, function (error, response, body) {
      lightjs.replacement('\\s# Created by https:.*((.|\\n)*)# End of https:.*\\s*', body, [gitignore]);
    });
  }
}

function installDependencies(swaaplateJsonData, projectDir) {
  const generalConfig = swaaplateJsonData.generalConfig;
  if (generalConfig.installDependencies) {
    const yarnOrNpm = generalConfig.useYarn ? 'yarn' : 'npm';
    lightjs.info(`install dependencies via ${yarnOrNpm}`);

    lightjs.setNpmDefault(!generalConfig.useYarn);
    shjs.cd(path.join(projectDir));
    lightjs.yarnpm('install');
  } else {
    lightjs.info('no dependencies will be installed');
  }
}

core.createProject = createProject;

module.exports = core;
