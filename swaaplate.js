'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const replace = require('replace');
const shjs = require('shelljs');
const uppercamelcase = require('uppercamelcase');

/* init */
init();

function init() {
  lightjs.info('initialize swaaplate');

  const swaaplateJsonData = lightjs.readJson('swaaplate.json');
  createProject(swaaplateJsonData);
  updateComponents(swaaplateJsonData);
  const packageJsonData = updatePackageJsonData(swaaplateJsonData);
  updateConfigJsonData(swaaplateJsonData);
  updateProject(swaaplateJsonData);
}

function createProject(swaaplateJsonData) {
  const projectDir = getProjectDir(swaaplateJsonData);
  const outputDir = swaaplateJsonData.generalConfig.outputDir;
  const projectName = swaaplateJsonData.packageJsonConfig.name;
  lightjs.info(`create project '${projectName}' in '${outputDir}'`);

  shjs.mkdir('-p', projectDir);
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/*', projectDir);
  shjs.cp('-r', 'node_modules/angular-webpack-minimum/.gitignore', projectDir);
  shjs.cp('swaaplate-*.js*', projectDir);
  shjs.cp('swaaplate.json', path.join(projectDir, 'swaaplate-recovery.json'));
  const serverConfig = swaaplateJsonData.serverConfig;
  if (serverConfig.simpleServer.use) {
    // TODO update data with simple Server
  } else {
    shjs.cp('springBoot/pom.xml', projectDir);
    const srcMain = 'src/main/';
    const srcTest = 'src/test/';
    const javaPath = path.join('java', serverConfig.springBoot.packagePath.replace(/\./g, '/'));
    const srcMainJavaPath = path.join(projectDir, srcMain, javaPath);
    const srcMainResources = path.join(projectDir, srcMain, 'resources');
    shjs.mkdir('-p', srcMainJavaPath);
    shjs.cp('springBoot/Application.java', srcMainJavaPath);
    shjs.mkdir('-p', srcMainResources);
    shjs.cp('springBoot/logback.xml', srcMainResources);
    shjs.cp('springBoot/application.properties', srcMainResources);
    shjs.mkdir('-p', path.join(projectDir, srcTest, javaPath));
    shjs.mkdir('-p', path.join(projectDir, srcTest, 'resources'));
  }
  shjs.rm(path.join(projectDir, 'yarn.lock'));
}

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
      path.join(srcDir, 'app/app.component.ts'),
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
    replace({ regex: `'app-${routes[i]}'`, replacement: template, paths: [ path.join(srcDir, 'app')], silent: true, recursive: true });
    if (configRoutes[i] !== routes[i]) {
      updateComponent(swaaplateJsonData, routes[i], configRoutes[i]);
    }
  }
}

function updateComponent(swaaplateJsonData, oldName, newName) {
  lightjs.info(`update component '${oldName}' to '${newName}'`);

  const srcDir = path.join(getProjectDir(swaaplateJsonData), 'src/app', oldName === 'dashboard' ? 'features' : '');
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
  packageJsonData.devDependencies['light-js'] = 'inpercima/light-js#v0.1.0';
  lightjs.writeJson(packageJson, packageJsonData);
  return packageJsonData;
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

function updateProject(swaaplateJsonData) {
  const projectDir = getProjectDir(swaaplateJsonData);
  lightjs.info(`update files in '${projectDir}' with project data`);

  const buildDir = swaaplateJsonData.generalConfig.buildDir;
  if (buildDir !== 'dist') {
    replace({
      regex: `(\\'|\\s|\\/)(dist)(\\'|\\/|\\s)`, replacement: `$1${buildDir}$3`, paths: [
        path.join(projectDir, 'webpack.common.js'),
        path.join(projectDir, 'webpack.dev.js'),
        path.join(projectDir, '.gitignore'),
      ], silent: true
    });
  }

  const author = swaaplateJsonData.packageJsonConfig.author;
  if (author !== 'Marcel Jänicke') {
    replace({regex: 'Marcel Jänicke', replacement: author, paths: [path.join(projectDir, 'LICENSE.md')], silent: true });
  }

  const packageJsonConfig = swaaplateJsonData.packageJsonConfig;
  const name = packageJsonConfig.name;
  const repository = packageJsonConfig.repository;
  replace({regex: '(- |cd )(angular-webpack-minimum)', replacement: `$1${name}`, paths: [path.join(projectDir, 'README.md')], silent: true });
  replace({regex: '(git clone )(.+)', replacement: `$1${repository}`, paths: [path.join(projectDir, 'README.md')], silent: true });

  const github = swaaplateJsonData.generalConfig.github;
  if (github.use) {
    replace({regex: '(org\\/)(inpercima)', replacement: `$1${github.username}`, paths: [path.join(projectDir, 'README.md')], silent: true });
    replace({regex: '(\\/)(angular-webpack-minimum)(\\/|\\?|\\))', replacement: `$1${name}$3`, paths: [path.join(projectDir, 'README.md')], silent: true });
  } else {
    // TODO, remove lines linking github
  }

  replace({regex: 'This.+tests.\\s*', replacement: '', paths: [path.join(projectDir, 'README.md')], silent: true });
  replace({regex: 'This project.+', replacement: packageJsonConfig.description, paths: [path.join(projectDir, 'README.md')], silent: true });
}
