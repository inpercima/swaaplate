'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const request = require('request');
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
    shjs.mv(path.join(projectDir, 'browserslist'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'karma.conf.js'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'tsconfig.app.json'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'tsconfig.spec.json'), path.join(projectDir, clientPath));
    shjs.mv(path.join(projectDir, 'src'), path.join(projectDir, clientPath, 'src'));
  }
  // java or kotlin
  if (serverConfig.endpoint === 'java' || serverConfig.endpoint === 'kotlin') {
    javaKotlin(srcMain, projectDir, swaaplateJsonData);
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

function javaKotlin(srcMain, projectDir, swaaplateJsonData) {
  const serverConfig = swaaplateJsonData.serverConfig;
  const author = swaaplateJsonData.packageJsonConfig.author;
  const endpoint = serverConfig.endpoint;
  const srcTest = 'src/test/';
  const serverSrcMain = path.join('server', srcMain);
  const serverSrcTest = path.join('server', srcTest);
  lightjs.info(`use endpoint '${endpoint}', create '${serverSrcMain}..' and '${serverSrcTest}..'`);

  const endpointPath = path.join(endpoint, serverConfig.packagePath.replace(/\./g, '/'));
  const serverSrcMainEndpointPath = path.join(projectDir, serverSrcMain, endpointPath);
  shjs.mkdir('-p', serverSrcMainEndpointPath);

  const serverSrcMainResources = path.join(projectDir, serverSrcMain, 'resources');
  const endpointExt = endpoint === 'kotlin' ? 'kt' : endpoint;
  shjs.cp(`endpoint/${endpoint}/Application.${endpointExt}`, serverSrcMainEndpointPath);
  shjs.cp(`endpoint/${endpoint}/CorsConfig.${endpointExt}`, serverSrcMainEndpointPath);

  const webDir = path.join(serverSrcMainEndpointPath, 'web');
  shjs.mkdir('-p', webDir);
  shjs.cp(`endpoint/${endpoint}/AuthController.${endpointExt}`, webDir);
  shjs.mkdir('-p', serverSrcMainResources);
  shjs.cp('endpoint/java-kotlin/*', serverSrcMainResources);

  shjs.mkdir('-p', path.join(projectDir, serverSrcTest, endpointPath));
  shjs.mkdir('-p', path.join(projectDir, serverSrcTest, 'resources'));

  lightjs.replacement('net.inpercima.swaaplate', serverConfig.packagePath, [serverSrcMainEndpointPath, serverSrcMainResources], true, true);

  const twoEol = `${os.EOL}${os.EOL}`;
  const indentSizeEndpoint = endpoint === 'kotlin' ? 2 : 4;
  const config = `${twoEol}[logback.xml]${os.EOL}indent_size = 4${twoEol}[*.${endpointExt}]${os.EOL}indent_size = ${indentSizeEndpoint}`;
  const editorconfig = path.join(projectDir, '.editorconfig');
  lightjs.replacement('(trim_trailing_whitespace = true)', `$1${config}`, [editorconfig]);

  const authorMj = 'Marcel Jänicke';
  if (author !== authorMj) {
    lightjs.replacement(authorMj, author, [serverSrcMainEndpointPath], true, true);
  }

  const readmeMdName = 'README.md';
  const readmeMd = path.join(projectDir, readmeMdName);
  const readmeMdClient = path.join(projectDir, 'client/README.md');
  const separateReadme = serverConfig.separateReadme;
  const usedReadmeMd = separateReadme ? readmeMdClient : readmeMd;

  lightjs.replacement('(### Node, npm or yarn)', `### Java${os.EOL}${os.EOL}* \`jdk 8\` or higher${os.EOL}${os.EOL}$1`, [readmeMd]);

  if (!separateReadme) {
    lightjs.replacement('(## Usage)', `$1 client`, [readmeMd]);
    lightjs.replacement('(# install tools and frontend dependencies)', `$1${os.EOL}cd client`, [readmeMd]);
    const devMode = `### Run in devMode with real data${twoEol}\`\`\`bash${os.EOL}cd server${os.EOL}./mvnw spring-boot:run${os.EOL}\`\`\`${twoEol}`;
    const prodMode = `### Run in prodMode with real data${twoEol}\`\`\`bash${os.EOL}cd server${os.EOL}./mvnw spring-boot:run -Pprod${os.EOL}\`\`\`${twoEol}`;
    const packageModeA = `### Package in prodMode with real data${twoEol}\`\`\`bash${os.EOL}cd server${os.EOL}./mvnw clean package -Pprod${twoEol}`;
    const packageModeB = `# without tests${os.EOL}./mvnw clean package -Pprod -DskipTests${os.EOL}\`\`\`${twoEol}`;
    lightjs.replacement('(### Tests)', `## Usage server${twoEol}${devMode}${prodMode}${packageModeA}${packageModeB}$1`, [readmeMd]);
  }

  lightjs.replacement('default: `./`', 'default: `http://localhost:8080/`', [usedReadmeMd]);
  lightjs.replacement('production: `./`', 'production: `http://localhost:8080/`', [usedReadmeMd]);

  const readmeMdServer = path.join(projectDir, 'server/README.md');
  shjs.cp('readme/README.java-kotlin.server.md', readmeMdServer);
  lightjs.replacement('swaaplate', swaaplateJsonData.packageJsonConfig.name, [readmeMdServer]);
  lightjs.replacement('(spring)', serverConfig.management === 'maven' ? './mvnw $1' : '', [readmeMdServer]);

  updateEnvironmentData(projectDir, 'http://localhost:8080/');

  const packageJsonName = 'package.json';
  const packageJson = path.join(projectDir, 'client', packageJsonName);
  const packageJsonData = lightjs.readJson(packageJson);
  packageJsonData.scripts['serve:dev'] = 'ng serve -o --configuration=dev';
  lightjs.writeJson(packageJson, packageJsonData);
}

function php(srcMain, projectDir, swaaplateJsonData) {
  const projectName = swaaplateJsonData.packageJsonConfig.name;
  lightjs.info(`-> update webpack config and api-endpoint`);

  const serverAsApi = swaaplateJsonData.serverConfig.serverAsApi;
  const separateReadme = swaaplateJsonData.serverConfig.separateReadme;
  const serverPath = serverAsApi ? 'api' : 'server';
  const packageJsonName = 'package.json';
  const packageJson = path.join(projectDir, 'client', packageJsonName);
  lightjs.info(`-> update '${packageJsonName}'`);
  let packageJsonData = lightjs.readJson(packageJson);
  packageJsonData.devDependencies['copy-webpack-plugin'] = '4.6.0';
  packageJsonData.devDependencies['@angular-builders/custom-webpack'] = '8.1.0';
  packageJsonData = updateTask(packageJsonData, 'build:mock');
  packageJsonData = updateTask(packageJsonData, 'watch:mock');
  lightjs.writeJson(packageJson, packageJsonData);

  const srcMainPath = path.join(projectDir, serverPath, srcMain);
  shjs.mkdir('-p', srcMainPath);
  shjs.cp('endpoint/php/auth.php', srcMainPath);
  shjs.cp('endpoint/php/auth.service.php', srcMainPath);
  shjs.cp('endpoint/php/.htaccess', srcMainPath);

  const webpackConfigPath = path.join(projectDir, 'client/webpack.config.js');
  shjs.cp('endpoint/php/webpack.config.js', webpackConfigPath);
  lightjs.replacement('api', serverPath, [webpackConfigPath]);

  const authServicePath = path.join(projectDir, serverPath, 'src/main/auth.service.php');
  lightjs.replacement('inpercima', projectName, [authServicePath]);

  const htaccess = swaaplateJsonData.serverConfig.htaccess;
  const readmeMdName = 'README.md';
  const readmeMd = path.join(projectDir, readmeMdName);
  const readmeMdClient = path.join(projectDir, 'client/README.md');
  const usedReadmeMd = separateReadme ? readmeMdClient : readmeMd;
  if (!htaccess) {
    shjs.rm(path.join(srcMainPath, '.htaccess'));
    const environment = path.join(projectDir, 'client/src/environments/environment.ts');
    lightjs.replacement('(apiSuffix: )\'\'', `$1'.php'`, [environment]);

    const environmentDev = path.join(projectDir, 'client/src/environments/environment.dev.ts');
    lightjs.replacement('(apiSuffix: )\'\'', `$1'.php'`, [environmentDev]);

    const environmentProd = path.join(projectDir, 'client/src/environments/environment.prod.ts');
    lightjs.replacement('(apiSuffix: )\'\'', `$1'.php'`, [environmentProd]);

    lightjs.replacement('default: EMPTY', 'default: `.php` | mock: EMPTY | production: `.php`', [usedReadmeMd]);
  }

  if (serverAsApi) {
    lightjs.replacement('default: `./`', 'default: `./api/`', [usedReadmeMd]);
    lightjs.replacement('production: `./`', 'production: `./api/`', [usedReadmeMd]);
  }

  if (!separateReadme) {
    lightjs.replacement('(# install tools and frontend dependencies)', `$1${os.EOL}cd client`, [readmeMd]);
  }

  const readmeMdServer = path.join(projectDir, serverPath, readmeMdName);
  shjs.cp('readme/README.php.server.md', readmeMdServer);
  if (serverAsApi) {
    lightjs.replacement('server', 'api', [readmeMdServer]);
  }

  updateEnvironmentData(projectDir, serverAsApi ? './api/' : './');
}

function updateTask(packageJsonData, mockTask) {
  const nodeEnv = `export NODE_ENV='mock'`;
  const task = packageJsonData.scripts[mockTask];
  packageJsonData.scripts[mockTask] = `${nodeEnv} && ${task}`;
  return packageJsonData;
}

function updateGitignore(swaaplateJsonData, projectDir) {
  const gitignoreName = '.gitignore';
  lightjs.info(`-> update '${gitignoreName}' with new endpoint and management data`);

  const endpoint = swaaplateJsonData.serverConfig.endpoint;
  if (endpoint === 'java' || endpoint === 'kotlin') {
    const management = swaaplateJsonData.serverConfig.management;
    const managementApi = management === 'maven' || management === 'gradle' ? `${management},` : '';
    const gitignore = path.join(projectDir, gitignoreName);
    const api = `https://www.gitignore.io/api/node,angular,${endpoint},${managementApi}eclipse,intellij+all,visualstudiocode`;
    request(api, function (error, response, body) {
      lightjs.replacement('\\s# Created by https:.*((.|\\n)*)# End of https:.*\\s*', body, [gitignore]);
      lightjs.replacement('(environment.prod.ts)', `$1${os.EOL}application-dev.yml${os.EOL}application-prod.yml`, [gitignore]);
    });
  }
}

function updateEnvironmentData(projectDir, api) {
  replaceInEnvironmentFile(projectDir, 'client/src/environments/environment.ts', api);
  replaceInEnvironmentFile(projectDir, 'client/src/environments/environment.dev.ts', api);
  replaceInEnvironmentFile(projectDir, 'client/src/environments/environment.prod.ts', api);
}

function replaceInEnvironmentFile(projectDir, environmentTsName, api) {
  const environmentTs = path.join(projectDir, environmentTsName);
  lightjs.info(`-> update '${environmentTsName}'`);

  lightjs.replacement('\\.\\/', `${api}`, [environmentTs]);
}

endpoint.configureEndpoint = configureEndpoint;

module.exports = endpoint;
