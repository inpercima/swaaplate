'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const replace = require('replace');
const shjs = require('shelljs');
const uppercamelcase = require('uppercamelcase');

const swendpoint = require('./swaaplate.endpoint.js');

let core = {};

/**
 * Creates the project for the specific endpoint.
 *
 * @param {object} swaaplateJsonData 
 */
function createProject(swaaplateJsonData) {
  const projectDir = getProjectDir(swaaplateJsonData);
  lightjs.info(`create project '${swaaplateJsonData.packageJsonConfig.name}' in '${swaaplateJsonData.generalConfig.outputDir}'`);

  shjs.mkdir('-p', projectDir);
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/*', projectDir);
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/.editorconfig', projectDir);
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/.gitattributes', projectDir);
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/.gitignore', projectDir);
  shjs.cp('core/swaaplate-update*.js*', projectDir);
  shjs.cp('swaaplate.json', path.join(projectDir, 'swaaplate-backup.json'));
  shjs.rm(path.join(projectDir, 'yarn.lock'));

  swendpoint.configureEndpoint(swaaplateJsonData, projectDir);
  swmanagement.configureManagement(swaaplateJsonData, projectDir);
}

/**
 * Ermittelt das Verzeichnis für das Projekt.
 *
 * @param {object} swaaplateJsonData 
 */
function getProjectDir(swaaplateJsonData) {
  return swaaplateJsonData.generalConfig.outputDir + swaaplateJsonData.packageJsonConfig.name;
}

function updateComponents(swaaplateJsonData) {
  const routes = ['dashboard', 'login', 'not-found'];
  const routeConfig = swaaplateJsonData.routeConfig;
  const configRoutes = [swaaplateJsonData.routeConfig.default, routeConfig.login.name, routeConfig.notFound.name];
  const projectDir = getProjectDir(swaaplateJsonData);
  const srcDir = path.join(projectDir, 'src');
  const selectorPrefix = swaaplateJsonData.generalConfig.selectorPrefix;

  if (selectorPrefix !== 'app') {
    replace({ regex: 'app-root', replacement: `${selectorPrefix}-root`, paths: [
      path.join(srcDir, 'web/app.component.ts'),
      path.join(srcDir, 'index.html')
    ], silent: true });
    const tslintJson = path.join(projectDir, 'tslint.json');
    const tslintJsonData = lightjs.readJson(tslintJson);
    tslintJsonData.rules["directive-selector"] = [true, "attribute", selectorPrefix, "camelCase"];
    tslintJsonData.rules["component-selector"] = [true, "element", selectorPrefix, "kebab-case"];
    lightjs.writeJson(tslintJson, tslintJsonData);
  }
  for (let i = 0; i < routes.length; i++) {
    const template = `'${selectorPrefix}-${configRoutes[i]}'`;
    replace({ regex: `'app-${routes[i]}'`, replacement: template, paths: [ path.join(srcDir, 'web')], silent: true, recursive: true });
    if (configRoutes[i] !== routes[i]) {
      updateComponent(swaaplateJsonData, routes[i], configRoutes[i]);
    }
  }
}

function updateComponent(swaaplateJsonData, oldName, newName) {
  lightjs.info(`update component '${oldName}' to '${newName}'`);

  const srcDir = path.join(getProjectDir(swaaplateJsonData), 'src/web', oldName === 'dashboard' ? 'features' : '');
  shjs.mv(path.join(srcDir, oldName), path.join(srcDir, newName));

  shjs.mv(path.join(srcDir, newName, `${oldName}.component.html`), path.join(srcDir, newName, `${newName}.component.html`));
  shjs.mv(path.join(srcDir, newName, `${oldName}.component.ts`), path.join(srcDir, newName, `${newName}.component.ts`));
  // changes not needed for dashboard
  if (oldName !== 'dashboard') {
    shjs.mv(path.join(srcDir, newName, `${oldName}.module.ts`), path.join(srcDir, newName, `${newName}.module.ts`));
    shjs.mv(path.join(srcDir, newName, `${oldName}-routing.module.ts`), path.join(srcDir, newName, `${newName}-routing.module.ts`));
  }
  // changes not needed for login
  if (oldName !== 'login') {
    replace({ regex: `${oldName}`, replacement: `${newName}`, paths: [
      path.join(srcDir, newName, `${newName}.component.html`)
    ], silent: true });
  }

  const oldUpper = uppercamelcase(oldName);
  const newUpper = uppercamelcase(newName);
  replace({ regex: `${oldUpper}Component`, replacement: `${newUpper}Component`, paths: [srcDir], silent: true, recursive: true });
  replace({ regex: `${oldUpper}Module`, replacement: `${newUpper}Module`, paths: [srcDir], silent: true, recursive: true });
  replace({ regex: `${oldUpper}RoutingModule`, replacement: `${newUpper}RoutingModule`, paths: [srcDir], silent: true, recursive: true });
  replace({ regex: `(\\'|\\/|\\s)(${oldName})(\\'|\\.|-)`, replacement: `$1${newName}$3`, paths: [srcDir], silent: true, recursive: true });
  replace({ regex: `(\\./)(${oldName})(/${newName})`, replacement: `$1${newName}$3`, paths: [srcDir], silent: true, recursive: true });

  // changes needed for login only after movement
  if (oldName === 'login') {
    replace({ regex: 'loginForm', replacement: `${newName}Form`, paths: [path.join(srcDir, newName)], silent: true, recursive: true });
  }
}

function updatePackageJsonData(swaaplateJsonData) {
  const projectDir = getProjectDir(swaaplateJsonData);
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

function updateConfigJsonData(swaaplateJsonData) {
  const projectDir = getProjectDir(swaaplateJsonData);
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

function updateGeneralProjectData(swaaplateJsonData) {
  const projectDir = getProjectDir(swaaplateJsonData);
  lightjs.info(`update general files in '${projectDir}' with project data`);

  const packageJsonConfig = swaaplateJsonData.packageJsonConfig;
  const readmePath = path.join(projectDir, 'README.md');
  const name = packageJsonConfig.name;
  const repository = packageJsonConfig.repository;
  replace({regex: '(- |cd )(angular-webpack-minimum)', replacement: `$1${name}`, paths: [readmePath], silent: true });
  replace({regex: '`angular-webpack-minimum`', replacement: `\`${name}\``, paths: [readmePath], silent: true });
  replace({regex: '(git clone )(.+)', replacement: `$1${repository}`, paths: [readmePath], silent: true });

  const generated = 'This project was generated with [swaaplate](https://github.com/inpercima/swaaplate).';
  const description = `${packageJsonConfig.description}${os.EOL}${os.EOL}${generated}`;
  replace({regex: 'This.+tests.\\s*', replacement: '', paths: [readmePath], silent: true });
  replace({regex: 'This project.+', replacement: description, paths: [readmePath], silent: true });
  replace({regex: '(config.json)', replacement: `$1${os.EOL}swaaplate-backup.json`, paths: [path.join(projectDir, '.gitignore')], silent: true });
}

function updateProjectDataByOption(swaaplateJsonData) {
  const projectDir = getProjectDir(swaaplateJsonData);
  lightjs.info(`update specific files in '${projectDir}' with project data`);
  
  const generalConfig = swaaplateJsonData.generalConfig;
  const serverConfig = swaaplateJsonData.serverConfig;
  const name = swaaplateJsonData.packageJsonConfig.name;
  const readmePath = path.join(projectDir, 'README.md');
  const buildWebDir = generalConfig.buildWebDir;
  const distDir = 'dist';
  if (buildWebDir !== distDir) {
    replace({
      regex: `(\\'|\\s|\\/)(${distDir})(\\'|\\/|\\s)`, replacement: `$1${buildWebDir}$3`, paths: [
        path.join(projectDir, 'webpack.common.js'),
        path.join(projectDir, 'webpack.dev.js'),
        path.join(projectDir, '.gitignore'),
      ], silent: true
    });
    if (serverConfig.endpoint === 'java') {
      replace({ regex: distDir, replacement: buildWebDir, paths: [path.join(projectDir, 'pom.xml')], silent: true });
    }
  }

  const author = swaaplateJsonData.packageJsonConfig.author;
  const authorMj = 'Marcel Jänicke';
  if (author !== authorMj) {
    replace({regex: authorMj, replacement: author, paths: [path.join(projectDir, 'LICENSE.md')], silent: true });
    if (serverConfig.endpoint === 'java') {
      const javaPath = path.join(projectDir, 'src/main/java', serverConfig.packagePath.replace(/\./g, '/'));
      replace({ regex: authorMj, replacement: author, paths: [path.join(javaPath, 'Application.java')], silent: true });
    }
  }

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
}

core.createProject = createProject;
core.updateComponents = updateComponents;
core.updatePackageJsonData = updatePackageJsonData;
core.updateConfigJsonData = updateConfigJsonData;
core.updateGeneralProjectData = updateGeneralProjectData;
core.updateProjectDataByOption = updateProjectDataByOption;

module.exports = core;
