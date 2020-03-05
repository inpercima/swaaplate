'use strict';

/* requirements */
const fs = require('fs');
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('./const.js');

let exp = {};
let projectConfig = {};
let projectPath = '';

/**
 * Configures the readme files.
 *
 * @param {object} pConfig
 * @param {string} pPath
 */
function configure(pConfig, pPath) {
  const packageJsonData = lightjs.readJson(swConst.PACKAGE_JSON);
  projectConfig = pConfig;
  projectPath = pPath;

  const templatePath = 'src/template/root/readme/';
  shjs.cp(path.join(templatePath, swConst.README_MD), projectPath);
  const readmeMdPath = path.join(projectPath, swConst.README_MD);
  const readmeHeaderMdData = fs.readFileSync(path.join(templatePath, 'README.header.md'), 'utf8');
  lightjs.replacement('{{PROJECT.READMEHEADER}}', updateReadmeHeaderRoot(readmeHeaderMdData, true), [readmeMdPath]);
  const serverConfig = projectConfig.server;
  if (serverConfig.backend !== swConst.JS) {
    shjs.cp(path.join('src/template/client/', swConst.README_MD), path.join(projectPath, swConst.CLIENT));
    lightjs.replacement('{{PROJECT.READMEHEADER}}', updateReadmeHeaderRoot(readmeHeaderMdData, false), [path.join(projectPath, swConst.CLIENT, swConst.README_MD)]);
  }
  let prerequisites = '';
  if (serverConfig.backend === swConst.PHP) {
    prerequisites += os.EOL + os.EOL + `### Apache and php

* \`Apache 2.4\` or higher
* \`php 7.3\` or higher`;
  }
  if (projectConfig.general.useDocker) {
    prerequisites += (prerequisites.length ? os.EOL + os.EOL : '') + `### Docker

* \`docker 19.03.5\` or higher
* \`docker-compose 1.25.0\` or higher`;
  }
  lightjs.replacement('{{PROJECT.PREREQUISITES}}', prerequisites, [readmeMdPath]);
  lightjs.replacement('{{PROJECT.USENPM}}', checkManager(swConst.NPM), [readmeMdPath]);
  lightjs.replacement('{{PROJECT.USEYARN}}', checkManager(swConst.YARN), [readmeMdPath]);

  const webpack = '| copy-webpack-plugin | 4.6.0 | 5.1.1 | "copy-webpack-plugin@5.1.1" has unmet peer dependency "webpack@^4.0.0" |';
  lightjs.replacement('{{PROJECT.DEPCHECK}}', serverConfig.backend === swConst.PHP ? os.EOL + webpack : '', [readmeMdPath]);

  const readmeGettingStartedMdData = fs.readFileSync(path.join(templatePath, 'README.getting-started.md'), 'utf8');
  lightjs.replacement('{{PROJECT.READMEGETTINGSTARTED}}', checkGettingStarted(readmeGettingStartedMdData, true), [readmeMdPath]);
  const readmeMdClientPath = path.join(projectPath, swConst.CLIENT, swConst.README_MD);
  if (serverConfig.backend !== swConst.JS) {
    lightjs.replacement('{{PROJECT.READMEGETTINGSTARTED}}', checkGettingStarted(readmeGettingStartedMdData, false), [readmeMdClientPath]);
  }

  const readmeClientData = serverConfig.backend === swConst.JS ? fs.readFileSync(path.join('src/template/client/', swConst.README_MD), 'utf8') : '';
  lightjs.replacement('{{PROJECT.READMEIMPORT}}', readmeClientData, [readmeMdPath]);

  const usage = `## Usage

### Modules` + os.EOL + os.EOL;
  lightjs.replacement('{{PROJECT.USAGE}}', serverConfig.backend !== swConst.JS ? usage : '', [readmeMdPath]);

  const clientLink = `For the client check [${projectConfig.general.name} - client](./client).` + os.EOL + os.EOL;
  const serverLink = `For the server check [${projectConfig.general.name} - server](./server).` + os.EOL + os.EOL;
  const dockerLink = `For the docker check [${projectConfig.general.name} - docker](./README_docker.md).`;
  lightjs.replacement('{{PROJECT.CLIENT}}', serverConfig.backend !== swConst.JS ? clientLink : '', [readmeMdPath]);
  lightjs.replacement('{{PROJECT.SERVER}}', serverConfig.backend !== swConst.JS ? serverLink : '', [readmeMdPath]);
  lightjs.replacement('{{PROJECT.DOCKER}}', projectConfig.general.useDocker ? dockerLink : '', [readmeMdPath]);
  lightjs.replacement('{{PROJECT.VERSION}}', packageJsonData.version, [readmeMdPath]);

  const clientConfig = projectConfig.client;
  const clientConfigRouting = clientConfig.routing;
  const api = serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN ? 'http://localhost:8080/' : ( serverConfig.backend === swConst.PHP && serverConfig.serverAsApi ? './api/' : './');
  const apiSuffix = serverConfig.backend === swConst.PHP && !serverConfig.htaccess ? '`.php`' : 'EMPTY';

  const readmeFile = serverConfig.backend === swConst.JS ? readmeMdPath : readmeMdClientPath;
  lightjs.replacement('{{PROJECT.ACTIVATELOGIN}}', clientConfigRouting.login.activate, [readmeFile]);
  lightjs.replacement('{{PROJECT.API}}', api, [readmeFile]);
  lightjs.replacement('{{PROJECT.APISUFFIX}}', apiSuffix, [readmeFile]);
  lightjs.replacement('{{PROJECT.DEFAULTROUTE}}', clientConfigRouting.features.default, [readmeFile]);
  lightjs.replacement('{{PROJECT.REDIRECTNOTFOUND}}', clientConfigRouting.notFound.redirect, [readmeFile]);
  lightjs.replacement('{{PROJECT.SHOWFEATURES}}', clientConfigRouting.features.show, [readmeFile]);
  lightjs.replacement('{{PROJECT.SHOWLOGIN}}', clientConfigRouting.login.show, [readmeFile]);
  lightjs.replacement('{{PROJECT.THEME}}', clientConfig.theme, [readmeFile]);
}

function checkManager(manager) {
  const usedText = ', used in this repository';
  const useYarn = projectConfig.client.useYarn;
  return useYarn && manager === swConst.YARN ? usedText : !useYarn && manager === swConst.NPM ? usedText + ', ' : '';
}

function checkGettingStarted(readmeGettingStartedMdData, isRoot) {
  const cd = `# all commands used in ./client${os.EOL}cd client`;
  const installTools = `# install tools and frontend dependencies${os.EOL}${projectConfig.client.useYarn ? swConst.YARN : swConst.NPM}`;
  const getttingStartet = `# clone project
git clone ${projectConfig.client.packageJson.repository}
cd ${projectConfig.general.name}${isRoot && projectConfig.server.backend === swConst.JS ? os.EOL + os.EOL + installTools : ''}`;
  readmeGettingStartedMdData = readmeGettingStartedMdData.replace('{{PROJECT.GETTINGSTARTED}}', isRoot ? getttingStartet : cd + os.EOL + os.EOL + installTools);
  return readmeGettingStartedMdData;
}

function updateReadmeHeaderRoot(readmeHeaderMdData, isRoot) {
  readmeHeaderMdData = readmeHeaderMdData.replace('{{PROJECT.TITLE}}', projectConfig.general.title + (isRoot ? '' : ' - client'));
  readmeHeaderMdData = readmeHeaderMdData.replace('{{PROJECT.LICENSE}}', checkLicense(isRoot));
  readmeHeaderMdData = readmeHeaderMdData.replace('{{PROJECT.DESCRIPTION}}', checkDescription(isRoot));
  readmeHeaderMdData = readmeHeaderMdData.replace('{{PROJECT.DEPENDENCIES}}', checkDependencies(isRoot));
  return readmeHeaderMdData;
}

function checkLicense(isRoot) {
  return isRoot && projectConfig.general.useMITLicense ? '[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)' : '';
}

function checkDescription(isRoot) {
  return isRoot ? os.EOL + os.EOL + projectConfig.general.description : '';
}

function checkDependencies(isRoot) {
  const serverConfig = projectConfig.server;
  const useDavidDm = (isRoot && serverConfig.backend === swConst.JS) || (!isRoot && serverConfig.backend !== swConst.JS);
  return projectConfig.client.ghUser !== '' && useDavidDm ? generateDavidDmLinks(isRoot) : '';
}

function generateDavidDmLinks(isRoot) {
  const pathParam = isRoot ? '' : '?path=client';
  const davidDmLink = `https://david-dm.org/${projectConfig.client.ghUser}/${projectConfig.general.name}`;
  const dependenciesStatus = `[![dependencies Status](${davidDmLink}/status.svg${pathParam})](${davidDmLink}${pathParam})`;
  const typeParam = isRoot ? '?' : '&';
  const devDependenciesStatus = `[![devDependencies Status](${davidDmLink}/dev-status.svg${pathParam})](${davidDmLink}${pathParam}${typeParam}type=dev)`;
  return (isRoot ? os.EOL : '') + dependenciesStatus + os.EOL + devDependenciesStatus;
}

exp.configure = configure;

module.exports = exp;
