'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
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
  shjs.rm('-rf', path.join(projectDir, 'node_modules'));

  shjs.cp('environments/*', path.join(projectDir, 'src/environments/'));

  updatePackageJsonData(swaaplateJsonData, projectDir);
  updateEnvironmentData(swaaplateJsonData, projectDir);
  updateGeneralProjectData(swaaplateJsonData, projectDir);
  updateMockData(swaaplateJsonData.packageJsonConfig.name, projectDir);
  replaceInReadmeFile(swaaplateJsonData, projectDir);
  replaceInAngularJsonFile(swaaplateJsonData, projectDir);

  const clientPath = swendpoint.configureEndpoint(swaaplateJsonData, projectDir);
  swmanagement.configureManagement(swaaplateJsonData, path.join(projectDir, 'server'));
  swcomponent.configureComponents(swaaplateJsonData, projectDir);

  installDependencies(swaaplateJsonData, path.join(projectDir, clientPath));
}

function updatePackageJsonData(swaaplateJsonData, projectDir) {
  const packageJsonName = 'package.json';
  const packageJson = path.join(projectDir, packageJsonName);
  lightjs.info(`update '${packageJsonName}'`);

  let packageJsonData = lightjs.readJson(packageJson);
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
  replaceInEnvironmentFile(swaaplateJsonData, projectDir, 'src/environments/environment.dev.ts');
  replaceInEnvironmentFile(swaaplateJsonData, projectDir, 'src/environments/environment.mock.ts');
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
  const karmaConfJs = 'karma.conf.js';
  const appPoName = 'app.po.ts';
  const gitignore = path.join(projectDir, gitignoreName);
  lightjs.info(`update '${gitignoreName}', '${licenseMdName}', '${appComponentSpecName}', '${appE2eSpecName}' and '${appPoName}'`);

  lightjs.replacement('(environment.prod.ts)', `$1${os.EOL}swaaplate-backup.json`, [gitignore]);
  const buildWebDir = swaaplateJsonData.generalConfig.buildWebDir;
  lightjs.replacement('(backup.json)', `$1${os.EOL}${buildWebDir}/`, [gitignore]);

  const author = swaaplateJsonData.packageJsonConfig.author;
  const authorMj = 'Marcel Jänicke';
  if (author !== authorMj) {
    lightjs.replacement(authorMj, author, [path.join(projectDir, licenseMdName)]);
  }

  const newName = swaaplateJsonData.packageJsonConfig.name;
  const newTitle = swaaplateJsonData.generalConfig.title;
  const oldName = 'angular-cli-for-swaaplate';
  if (swaaplateJsonData.generalConfig.name !== oldName) {
    lightjs.replacement(oldName, newName, [path.join(projectDir, karmaConfJs)]);
    lightjs.replacement(oldName, newTitle, [path.join(projectDir, 'src/app/', appComponentSpecName)]);
    lightjs.replacement(oldName, newTitle, [path.join(projectDir, 'e2e/src/', appE2eSpecName)]);
  }

  lightjs.replacement('app(-root)', `${swaaplateJsonData.generalConfig.selectorPrefix}$1`, [path.join(projectDir, 'e2e/src/', appPoName)]);
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

  lightjs.replacement('angular-cli-for-swaaplate', title, [path.join(projectDir, mockMiddlewareName)]);
}

function replaceInReadmeFile(swaaplateJsonData, projectDir) {
  const readmeMdName = 'README.md';
  lightjs.info(`update '${readmeMdName}'`);

  const packageJsonConfig = swaaplateJsonData.packageJsonConfig;
  const name = packageJsonConfig.name;
  const readmeMd = path.join(projectDir, readmeMdName);
  const packageJsonData = lightjs.readJson('package.json');
  const generated = `This project was generated with [swaaplate](https://github.com/inpercima/swaaplate) version ${packageJsonData.version}.`;
  const description = `${packageJsonConfig.description}${os.EOL}${os.EOL}${generated}`;

  // replace the first sentence
  lightjs.replacement('This.+projects.\\s*', '', [readmeMd]);
  // replace the second sentence
  lightjs.replacement('This project.+', description, [readmeMd]);

  lightjs.replacement('angular-cli-for-swaaplate', name, [readmeMd]);
  lightjs.replacement('(git clone )(.+)', `$1${packageJsonConfig.repository}`, [readmeMd]);

  // apend line in dependency table for copy-webpack-plugin
  const lineWebpackPlugin = '| copy-webpack-plugin | 4.6.0 | copy-webpack-plugin@5.0.3" has unmet peer dependency "webpack@^4.0.0" |';
  lightjs.replacement('(3.4 < 3.5 \\|)', `$1${os.EOL}${lineWebpackPlugin}`, [readmeMd]);

  checkSeparateReadme(swaaplateJsonData, projectDir, name, readmeMd);
}

function checkSeparateReadme(swaaplateJsonData, projectDir, name, readmeMd) {
  const serverConfig = swaaplateJsonData.serverConfig;
  const generalConfig = swaaplateJsonData.generalConfig;
  const github = generalConfig.github;
  const separateReadme = serverConfig.separateReadme;
  const readmeMdClient = path.join(projectDir, 'client/README.md');
  if (separateReadme) {
    lightjs.info(`update '${readmeMdClient}'`);
    shjs.mkdir('-p', path.join(projectDir, 'client'));
    shjs.cp('readme/README.client.md', readmeMdClient);
    lightjs.replacement('swaaplate', name, [readmeMdClient]);
    lightjs.replacement('\\[!\\[dependencies.*\\s\\[.*\\s', '', [readmeMd]);

    const url = github.use ? `https://github.com/${github.username}/` : '';
    const usageClient = `${os.EOL}${os.EOL}For the client check [${name} - client](${url}${name}/tree/master/client).`;
    const serverOrApi = serverConfig.serverAsApi ? 'api' : 'server';
    const usageServer = `${os.EOL}${os.EOL}For the ${serverOrApi} check [${name} - ${serverOrApi}](${url}${name}/tree/master/${serverOrApi}).`;

    lightjs.replacement('Usage[\\s\\S]*?change it.', `Usage${usageClient}${usageServer}`, [readmeMd]);
    lightjs.replacement(`(cd ${name})[\\s\\S]*?.gitignore.`, `$1${os.EOL}\`\`\``, [readmeMd]);
  }

  const usedReadmeMd = separateReadme ? readmeMdClient : readmeMd;
  if (github.use) {
    lightjs.replacement('(org\\/)(inpercima)', `$1${github.username}`, [usedReadmeMd]);
    lightjs.replacement('(\\/)(angular-cli-for-swaaplate)(\\/|\\?|\\))', `$1${name}$3`, [usedReadmeMd]);
    lightjs.replacement('(\\/)(swaaplate)(\\/|\\?|\\))', `$1${name}$3`, [usedReadmeMd]);
  } else {
    lightjs.replacement('\\[!\\[dependencies.*\\s\\[.*\\s', '', [usedReadmeMd]);
  }

  if (!generalConfig.useYarn) {
    lightjs.replacement('or higher,.*', 'or higher', [usedReadmeMd]);
    lightjs.replacement('or higher or', 'or higher, used in this repository, or', [usedReadmeMd]);
    lightjs.replacement('yarn (.*:)', `npm run $1`, [usedReadmeMd]);

    // replace 'install tools and frontend dependencies'
    lightjs.replacement('(dependencies\\s)(yarn)', `$1npm install`, [usedReadmeMd]);
  }

  if (generalConfig.theme !== 'indigo-pink') {
    lightjs.replacement('(default: )`indigo-pink`', `$1\`${generalConfig.theme}\``, [usedReadmeMd]);
  }

  const defaultRoute = swaaplateJsonData.routeConfig.default;
  if (defaultRoute !== 'dashboard') {
    lightjs.replacement('`dashboard`', `\`${defaultRoute}\``, [usedReadmeMd]);
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

  // extend webpack behaviour on php to copy php code
  if (swaaplateJsonData.serverConfig.endpoint === 'php') {
    lightjs.replacement('@angular-devkit/build-angular:browser', '@angular-builders/custom-webpack:browser', [angularJson]);
    lightjs.replacement('@angular-devkit/build-angular:dev-server', '@angular-builders/custom-webpack:dev-server', [angularJson]);
    const webpackConfig = `$1${os.EOL}            "customWebpackConfig": {${os.EOL}              "path": "./webpack.config.js"${os.EOL}            },`;
    lightjs.replacement('("outputPath": "dist",)', webpackConfig, [angularJson]);
  }
}

function installDependencies(swaaplateJsonData, projectDir) {
  const generalConfig = swaaplateJsonData.generalConfig;
  if (generalConfig.installDependencies) {
    const yarnOrNpm = generalConfig.useYarn ? 'yarn' : 'npm';
    lightjs.info(`install dependencies via ${yarnOrNpm}`);

    lightjs.setNpmDefault(!generalConfig.useYarn);
    shjs.cd(projectDir);
    lightjs.yarnpm('install');
  } else {
    lightjs.info('no dependencies will be installed');
  }
}

core.createProject = createProject;

module.exports = core;
