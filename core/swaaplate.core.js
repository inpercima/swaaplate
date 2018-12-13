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
  updateEnvironmentData(swaaplateJsonData, projectDir);
  updateGeneralProjectData(swaaplateJsonData, projectDir);
  updateMockData(swaaplateJsonData.packageJsonConfig.name, projectDir);
  replaceInReadmeFile(swaaplateJsonData, projectDir);
  replaceInAngularJsonFile(swaaplateJsonData, projectDir);

  swendpoint.configureEndpoint(swaaplateJsonData, projectDir);
  swmanagement.configureManagement(swaaplateJsonData, projectDir);
  swcomponent.configureComponents(swaaplateJsonData, projectDir);

  installDependencies(swaaplateJsonData, projectDir);
}

function updatePackageJsonData(swaaplateJsonData, projectDir) {
  const packageJsonName = 'package.json';
  const packageJson = path.join(projectDir, packageJsonName);
  lightjs.info(`update '${packageJsonName}'`);

  const packageJsonData = lightjs.readJson(packageJson);
  const config = swaaplateJsonData.packageJsonConfig;
  packageJsonData.author = config.author;
  packageJsonData.contributors = config.contributors;
  packageJsonData.description = config.description;
  packageJsonData.name = config.name;

  const github = swaaplateJsonData.generalConfig.github;
  packageJsonData.repository = github.use ? `https://github.com/${github.username}/${config.name}` : config.repository;

  if (config.homepage === '' && packageJsonData.repository !== '') {
    packageJsonData.homepage = packageJsonData.repository;
  } else {
    packageJsonData.homepage = config.homepage;
  }

  packageJsonData.version = '0.0.1-SNAPSHOT';
  lightjs.writeJson(packageJson, packageJsonData);
}

function updateEnvironmentData(swaaplateJsonData, projectDir) {
  replaceInEnvironmentFile(swaaplateJsonData, projectDir, 'src/environments/environment.ts');
  replaceInEnvironmentFile(swaaplateJsonData, projectDir, 'src/environments/environment.staging.ts');
  replaceInEnvironmentFile(swaaplateJsonData, projectDir, 'src/environments/environment.prod.ts');
}

function replaceInEnvironmentFile(swaaplateJsonData, projectDir, environmentTsName) {
  const environmentTs = path.join(projectDir, environmentTsName);
  lightjs.info(`update '${environmentTsName}'`);

  const routeConfig = swaaplateJsonData.routeConfig;
  lightjs.replacement('(activateLogin: )true', `$1${routeConfig.login.activate}`, [environmentTs]);
  lightjs.replacement('angular-cli-for-swaaplate', swaaplateJsonData.generalConfig.title, [environmentTs]);
  lightjs.replacement('dashboard', routeConfig.default, [environmentTs]);
  lightjs.replacement('(redirectNotFound: )false', `$1${routeConfig.notFound.redirect}`, [environmentTs]);
  lightjs.replacement('(showFeatures: )true', `$1${routeConfig.features.show}`, [environmentTs]);
  lightjs.replacement('(showLogin: )false', `$1${routeConfig.login.show}`, [environmentTs]);
  lightjs.replacement('indigo-pink', swaaplateJsonData.generalConfig.theme, [environmentTs]);
}

function updateGeneralProjectData(swaaplateJsonData, projectDir) {
  const gitignoreName = '.gitignore';
  const licenseMdName = 'LICENSE.md';
  const appComponentSpecName = 'app.component.spec.ts';
  const appE2eSpecName = 'app.e2e-spec.ts';
  const appPoName = 'app.po.ts';
  const gitignore = path.join(projectDir, gitignoreName);
  lightjs.info(`update '${gitignoreName}', '${licenseMdName}', '${appComponentSpecName}', '${appE2eSpecName}' and '${appPoName}'`);

  const replacement = `# project specific${os.EOL}${os.EOL}swaaplate-backup.json${os.EOL}${os.EOL}# end of project specific${os.EOL}${os.EOL}$1`;
  lightjs.replacement('(# Created by https)', replacement, [gitignore]);
  const buildWebDir = swaaplateJsonData.generalConfig.buildWebDir;
  const distDir = 'dist';
  if (buildWebDir !== distDir) {
    lightjs.replacement('(backup.json)', `$1${os.EOL}/${buildWebDir}`, [gitignore]);
  }

  const author = swaaplateJsonData.packageJsonConfig.author;
  const authorMj = 'Marcel Jänicke';
  if (author !== authorMj) {
    lightjs.replacement(authorMj, author, [path.join(projectDir, licenseMdName)]);
  }

  const newTitle = swaaplateJsonData.generalConfig.title;
  const oldTitle = 'angular-cli-for-swaaplate';
  if (swaaplateJsonData.generalConfig.title !== oldTitle) {
    lightjs.replacement(oldTitle, newTitle, [path.join(projectDir, 'src/app/', appComponentSpecName)]);
    lightjs.replacement(oldTitle, newTitle, [path.join(projectDir, 'e2e/src/', appE2eSpecName)]);
  }

  const appPoTs = path.join(projectDir, 'e2e/src/', appPoName);
  lightjs.replacement('app(-root)', `${swaaplateJsonData.generalConfig.selectorPrefix}$1`, [appPoTs]);
}

function updateMockData(title, projectDir) {
  const mockDbName = 'mock/db.json';
  const mockMiddlewareName = 'mock/middleware.js';
  lightjs.info(`update '${mockDbName}' and '${mockMiddlewareName}'`);

  const dbJson = path.join(projectDir, mockDbName);
  const dbJsonData = lightjs.readJson(dbJson);
  dbJsonData.users[0].username = title;
  dbJsonData.users[0].password = title;
  lightjs.writeJson(dbJson, dbJsonData);

  lightjs.replacement('inpercima', title, [path.join(projectDir, mockMiddlewareName)]);
}

function replaceInReadmeFile(swaaplateJsonData, projectDir) {
  const readmeMdName = 'README.md';
  lightjs.info(`update '${readmeMdName}'`);

  const packageJsonConfig = swaaplateJsonData.packageJsonConfig;
  const name = packageJsonConfig.name;
  const readmeMd = path.join(projectDir, readmeMdName);
  lightjs.replacement('angular-cli-for-swaaplate', name, [readmeMd]);
  lightjs.replacement('(git clone )(.+)', `$1${packageJsonConfig.repository}`, [readmeMd]);

  const generated = 'This project was generated with [swaaplate](https://github.com/inpercima/swaaplate).';
  const description = `${packageJsonConfig.description}${os.EOL}${os.EOL}${generated}`;
  lightjs.replacement('This.+projects.\\s*', '', [readmeMd]);
  lightjs.replacement('This project.+', description, [readmeMd]);

  const generalConfig = swaaplateJsonData.generalConfig;
  const github = generalConfig.github;
  if (github.use) {
    lightjs.replacement('(org\\/)(inpercima)', `$1${github.username}`, [readmeMd]);
    lightjs.replacement('(\\/)(angular-cli-for-swaaplate)(\\/|\\?|\\))', `$1${name}$3`, [readmeMd]);
  } else {
    lightjs.replacement('\\[!\\[dependencies.*\\s\\[.*\\s', '', [readmeMd]);
  }

  if (!generalConfig.useYarn) {
    lightjs.replacement('or higher,.*', 'or higher', [readmeMd]);
    lightjs.replacement('or higher or', 'or higher, used in this repository, or', [readmeMd]);
    lightjs.replacement('yarn run', 'npm run', [readmeMd]);
    lightjs.replacement('(dependencies\\s)(yarn)', `$1npm install`, [readmeMd]);
  }

  if (generalConfig.theme !== 'indigo-pink') {
    lightjs.replacement('(default: )`indigo-pink`', `$1\`${generalConfig.theme}\``, [readmeMd]);
  }

  const defaultRoute = swaaplateJsonData.routeConfig.default;
  if (defaultRoute !== 'dashboard') {
    lightjs.replacement('`dashboard`', `\`${defaultRoute}\``, [readmeMd]);
  }
}

function replaceInAngularJsonFile(swaaplateJsonData, projectDir) {
  const angularJsonName = 'angular.json';
  lightjs.info(`update '${angularJsonName}'`);

  const packageJsonConfig = swaaplateJsonData.packageJsonConfig;
  const name = packageJsonConfig.name;
  const angularJson = path.join(projectDir, angularJsonName);
  lightjs.replacement('angular-cli-for-swaaplate', name, [angularJson]);

  const generalConfig = swaaplateJsonData.generalConfig;
  if (generalConfig.buildWebDir !== 'dist') {
    lightjs.replacement('"dist"', `"${generalConfig.buildWebDir}"`, [angularJson]);
  }

  if (generalConfig.theme !== 'indigo-pink') {
    lightjs.replacement('indigo-pink', generalConfig.theme, [angularJson]);
  }

  if (generalConfig.selectorPrefix !== 'app') {
    lightjs.replacement('"app"', `"${generalConfig.selectorPrefix}"`, [angularJson]);
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
