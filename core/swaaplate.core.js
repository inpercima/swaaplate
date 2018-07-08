'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const replace = require('replace');
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
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/*', projectDir);
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/.editorconfig', projectDir);
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/.gitattributes', projectDir);
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/.gitignore', projectDir);
  shjs.cp('core/swaaplate-update*.js*', projectDir);
  shjs.cp('swaaplate.json', path.join(projectDir, 'swaaplate-backup.json'));
  shjs.rm(path.join(projectDir, 'yarn.lock'));

  updatePackageJsonData(swaaplateJsonData, projectDir);
  updateConfigJsonData(swaaplateJsonData, projectDir);
  updateGeneralProjectData(swaaplateJsonData, projectDir);

  swendpoint.configureEndpoint(swaaplateJsonData, projectDir);
  swmanagement.configureManagement(swaaplateJsonData, projectDir);
  swcomponent.configureComponents(swaaplateJsonData, projectDir);
}

function updatePackageJsonData(swaaplateJsonData, projectDir) {
  const packageJson = path.join(projectDir, 'package.json');
  lightjs.info(`update '${packageJson}'`);

  const packageJsonData = lightjs.readJson(packageJson);
  const config = swaaplateJsonData.packageJsonConfig;
  packageJsonData.author = config.author;
  packageJsonData.contributors = config.contributors;
  packageJsonData.description = config.description;
  packageJsonData.homepage = config.homepage;
  packageJsonData.name = config.name;
  packageJsonData.repository = config.repository;
  packageJsonData.devDependencies['light-js'] = 'inpercima/light-js#v0.1.1';
  if (swaaplateJsonData.serverConfig.endpoint === 'php') {
    packageJsonData.devDependencies['copy-webpack-plugin'] = '4.5.1';
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
  lightjs.info(`update '${path.join(projectDir, 'webpack.common.js')}'`);
  lightjs.info(`update '${path.join(projectDir, 'webpack.dev.js')}'`);
  lightjs.info(`update '${path.join(projectDir, '.gitignore')}'`);

  const buildWebDir = swaaplateJsonData.generalConfig.buildWebDir;
  const distDir = 'dist';
  if (buildWebDir !== distDir) {
    replace({
      regex: `(\\'|\\s|\\/)(${distDir})(\\'|\\/|\\s)`, replacement: `$1${buildWebDir}$3`, paths: [
        path.join(projectDir, 'webpack.common.js'),
        path.join(projectDir, 'webpack.dev.js'),
        path.join(projectDir, '.gitignore'),
      ], silent: true
    });
  }
  replace({regex: '(config.json)', replacement: `$1${os.EOL}swaaplate-backup.json`, paths: [path.join(projectDir, '.gitignore')], silent: true });

  const author = swaaplateJsonData.packageJsonConfig.author;
  const authorMj = 'Marcel Jänicke';
  if (author !== authorMj) {
    replace({regex: authorMj, replacement: author, paths: [path.join(projectDir, 'LICENSE.md')], silent: true });
  }

  replaceInReadme(swaaplateJsonData, projectDir);
}

function replaceInReadme(swaaplateJsonData, projectDir) {
  const readme = 'README.md';
  lightjs.info(`update '${path.join(projectDir, readme)}'`);

  const packageJsonConfig = swaaplateJsonData.packageJsonConfig;
  const name = packageJsonConfig.name;
  const readmePath = path.join(projectDir, readme);
  replace({regex: 'angular-webpack-minimum', replacement: `${name}`, paths: [readmePath], silent: true });
  replace({regex: '`angular-webpack-minimum`', replacement: `\`${name}\``, paths: [readmePath], silent: true });
  replace({regex: '(git clone )(.+)', replacement: `$1${packageJsonConfig.repository}`, paths: [readmePath], silent: true });

  const generated = 'This project was generated with [swaaplate](https://github.com/inpercima/swaaplate).';
  const description = `${packageJsonConfig.description}${os.EOL}${os.EOL}${generated}`;
  replace({regex: 'This.+tests.\\s*', replacement: '', paths: [readmePath], silent: true });
  replace({regex: 'This project.+', replacement: description, paths: [readmePath], silent: true });

  const generalConfig = swaaplateJsonData.generalConfig;
  const github = generalConfig.github;
  if (github.use) {
    replace({regex: '(org\\/)(inpercima)', replacement: `$1${github.username}`, paths: [readmePath], silent: true });
    replace({regex: '(\\/)(angular-webpack-minimum)(\\/|\\?|\\))', replacement: `$1${name}$3`, paths: [readmePath], silent: true });
  } else {
    replace({regex: '\\[!\\[dependencies.*\\s\\[.*\\s', replacement: '', paths: [readmePath], silent: true });
  }

  if (!generalConfig.useYarn) {
    replace({regex: 'or higher,.*', replacement: 'or higher', paths: [readmePath], silent: true });
    replace({regex: 'or higher or', replacement: 'or higher, used in this repository, or', paths: [readmePath], silent: true });
    replace({regex: 'yarn run', replacement: 'npm run', paths: [readmePath], silent: true });
    replace({regex: '(dependencies\\s)(yarn)', replacement: `$1npm install`, paths: [readmePath], silent: true });
  }

  const defaultRoute = swaaplateJsonData.routeConfig.default;
  if (defaultRoute !== 'dashboard') {
    replace({regex: '`dashboard`', replacement: `\`${defaultRoute}\``, paths: [readmePath], silent: true });
  }
}

core.createProject = createProject;

module.exports = core;
