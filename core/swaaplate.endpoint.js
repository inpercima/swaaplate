'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

let endpoint = {};

/**
 * Configures the endpoint of the app.
 *
 * @param {object} swaaplateJsonData
 */
function configureEndpoint(swaaplateJsonData, projectDir) {
  let clientPath = '';
  const serverConfig = swaaplateJsonData.serverConfig;
  lightjs.info(`prepare data for endpoint '${serverConfig.endpoint}'`);

  updateGitignore(swaaplateJsonData, projectDir);

  // java, kotlin and php
  const srcMain = 'src/main/';
  if (serverConfig.endpoint !== 'js') {
    clientPath = 'client';
    shjs.mkdir('-p', path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'e2e'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'mock'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'angular.json'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'package.json'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'tsconfig.json'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'tslint.json'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'webpack.config.js'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'src'), path.join(projectDir, clientPath, 'src'));
  }
  // java or kotlin
  if (serverConfig.endpoint === 'java' || serverConfig.endpoint === 'kotlin') {
    javaKotlin(srcMain, projectDir, serverConfig, swaaplateJsonData.packageJsonConfig.author);
  }
  // php
  if (serverConfig.endpoint === 'php') {
    php(srcMain, projectDir, swaaplateJsonData);
  }
  // js
  if (serverConfig.endpoint === 'js') {
    lightjs.info(`use endpoint 'js', nothing special todo`);
  }
  return clientPath;
}

function javaKotlin(srcMain, projectDir, serverConfig, author) {
  const endpoint = serverConfig.endpoint;
  lightjs.info(`use endpoint '${endpoint}', create 'src/main/..' and 'src/test/..'`);

  const endpointPath = path.join(endpoint, serverConfig.packagePath.replace(/\./g, '/'));
  const srcMainEndpointPath = path.join(projectDir, srcMain, endpointPath);
  const srcMainResources = path.join(projectDir, srcMain, 'resources');
  shjs.mkdir('-p', srcMainEndpointPath);

  const endpointExt = endpoint === 'kotlin' ? 'kt' : endpoint;
  shjs.cp(`endpoint/${endpoint}/Application.${endpointExt}`, srcMainEndpointPath);
  shjs.mkdir('-p', srcMainResources);
  shjs.cp('endpoint/java-kotlin/logback.xml', srcMainResources);
  shjs.cp('endpoint/java-kotlin/application.yml', srcMainResources);

  const srcTest = 'src/test/';
  shjs.mkdir('-p', path.join(projectDir, srcTest, endpointPath));
  shjs.mkdir('-p', path.join(projectDir, srcTest, 'resources'));
  lightjs.replacement('net.inpercima.swaaplate', serverConfig.packagePath, [
    path.join(projectDir, srcMain, endpointPath, `Application.${endpointExt}`),
    path.join(srcMainResources, 'logback.xml'),
  ]);

  const indentSizeEndpoint = endpoint === 'kotlin' ? 2 : 4;
  const config = `${os.EOL}${os.EOL}[logback.xml]${os.EOL}indent_size = 4${os.EOL}${os.EOL}[*.${endpointExt}]${os.EOL}indent_size = ${indentSizeEndpoint}`;
  const editorconfig = path.join(projectDir, '.editorconfig');
  lightjs.replacement('(trim_trailing_whitespace = true)', `$1${config}`, [editorconfig]);

  const authorMj = 'Marcel Jänicke';
  if (author !== authorMj) {
    lightjs.replacement(authorMj, author, [path.join(srcMainEndpointPath, `Application.${endpointExt}`)]);
  }

  const readmeMdName = 'README.md';
  const readmeMd = path.join(projectDir, readmeMdName);
  lightjs.replacement('(## Usage\\s)', `$1${os.EOL}TODO: Update usage for ${endpoint}${os.EOL}`, [readmeMd]);

  updateEnvironmentData(projectDir, 'http://localhost:8080');
}

function php(srcMain, projectDir, swaaplateJsonData) {
  const projectName = swaaplateJsonData.packageJsonConfig.name;
  lightjs.info(`-> update webpack config and api-endpoint`);

  const serverAsApi = swaaplateJsonData.serverConfig.serverAsApi;
  const serverPath = serverAsApi ? 'api' : 'server';
  const packageJsonName = 'package.json';
  const packageJson = path.join(projectDir, 'client', packageJsonName);
  lightjs.info(`-> update '${packageJsonName}'`);
  const packageJsonData = lightjs.readJson(packageJson);
  packageJsonData.devDependencies['copy-webpack-plugin'] = '4.5.4';
  lightjs.writeJson(packageJson, packageJsonData);

  const srcMainPath = path.join(projectDir, serverPath, srcMain);
  shjs.mkdir('-p', srcMainPath);
  shjs.cp('endpoint/php/*', srcMainPath);
  shjs.cp('endpoint/php/.htaccess', srcMainPath);

  const copyWebpackPlugin = `$1${os.EOL}const CopyWebpackPlugin = require('copy-webpack-plugin');`;
  const webpackConfigJs = path.join(projectDir, 'client/webpack.config.js');
  lightjs.replacement('(webpack.*=.*)', copyWebpackPlugin, [webpackConfigJs]);

  const copyFrom = `      from: '../${serverPath}/src/main',${os.EOL}`;
  const copyToApi = serverAsApi ? `      to: './api',${os.EOL}` : '';
  const copyWebpackPluginSection = `$1${os.EOL}  plugins: [ process.env.NODE_ENV !== 'dev' ?${os.EOL}    new CopyWebpackPlugin([{${os.EOL}${copyFrom}${copyToApi}    }]) : {},${os.EOL}  ],`;
  lightjs.replacement('(},)', copyWebpackPluginSection, [webpackConfigJs]);

  const authServicePath = path.join(projectDir, serverPath, 'src/main/auth.service.php');
  lightjs.replacement('inpercima', projectName, [authServicePath]);

  const htaccess = swaaplateJsonData.serverConfig.htaccess;
  const readmeMdName = 'README.md';
  const readmeMd = path.join(projectDir, readmeMdName);
  if (!htaccess) {
    shjs.rm(path.join(srcMainPath, '.htaccess'));
    const environmentStaging = path.join(projectDir, 'client/src/environments/environment.staging.ts');
    lightjs.replacement('(apiSuffix: )\'\'', `$1'.php'`, [environmentStaging]);

    const environmentProd = path.join(projectDir, 'client/src/environments/environment.prod.ts');
    lightjs.replacement('(apiSuffix: )\'\'', `$1'.php'`, [environmentProd]);

    lightjs.replacement('staging: `EMPTY`', 'staging: `.php`', [readmeMd]);
    lightjs.replacement('production: `EMPTY`', 'production: `.php`', [readmeMd]);
  }

  if (serverAsApi) {
    lightjs.replacement('staging: `./`', 'staging: `./api/`', [readmeMd]);
    lightjs.replacement('production: `./`', 'production: `./api/`', [readmeMd]);
  }

  lightjs.replacement('(# install tools and frontend dependencies)', `$1${os.EOL}cd client`, [readmeMd]);

  updateEnvironmentData(projectDir, serverAsApi ? './api/' : './');
}

function updateGitignore(swaaplateJsonData, projectDir) {
  const gitignoreName = '.gitignore';
  lightjs.info(`-> update '${gitignoreName}' with new endpoint and manangement data`);

  const endpoint = swaaplateJsonData.serverConfig.endpoint;
  if (endpoint === 'java' || endpoint === 'kotlin') {
    const management = swaaplateJsonData.serverConfig.management;
    const managementApi = management === 'maven' || management === 'gradle' ? `${management},` : '';
    const gitignore = path.join(projectDir, gitignoreName);
    const api = `https://www.gitignore.io/api/angular,node,${endpoint},${managementApi}eclipse,intellij+all,visualstudiocode`;
    request(api, function (error, response, body) {
      lightjs.replacement('\\s# Created by https:.*((.|\\n)*)# End of https:.*\\s*', body, [gitignore]);
    });
  }
}

function updateEnvironmentData(projectDir, api) {
  replaceInEnvironmentFile(projectDir, 'client/src/environments/environment.staging.ts', api);
  replaceInEnvironmentFile(projectDir, 'client/src/environments/environment.prod.ts', api);
}

function replaceInEnvironmentFile(projectDir, environmentTsName, api) {
  const environmentTs = path.join(projectDir, environmentTsName);
  lightjs.info(`-> update '${environmentTsName}'`);

  lightjs.replacement('\\.\\/', `${api}`, [environmentTs]);
}

endpoint.configureEndpoint = configureEndpoint;

module.exports = endpoint;
