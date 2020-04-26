'use strict';

/* requirements */
const fs = require('fs');
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('./const');
const swHelper = require('./helper');

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

  shjs.cp(path.join(swConst.TEMPLATE_ROOT_README, swConst.README_MD), projectPath);
  const readmeMdPath = path.join(projectPath, swConst.README_MD);
  updateReadmeHeader(readmeMdPath);
  updatePrerequisites(readmeMdPath);

  lightjs.replacement('{{PROJECT.USENPM}}', checkManager(swConst.NPM), [readmeMdPath]);
  lightjs.replacement('{{PROJECT.USEYARN}}', checkManager(swConst.YARN), [readmeMdPath]);

  const webpack = '| copy-webpack-plugin | 4.6.0 | 5.1.1 | "copy-webpack-plugin@5.1.1" has unmet peer dependency "webpack@^4.0.0" |';
  lightjs.replacement('{{PROJECT.DEPCHECK}}', swHelper.isPhp() ? os.EOL + webpack : '', [readmeMdPath]);

  updateReadmeGettingStarted(readmeMdPath);

  const readmeClientData = swHelper.isJs() ? fs.readFileSync(swConst.TEMPLATE_CLIENT_README, 'utf8') : os.EOL;
  lightjs.replacement('{{PROJECT.READMEIMPORT}}', readmeClientData, [readmeMdPath]);
  if (swHelper.isJs()) {
    lightjs.replacement('{{PROJECT.READMEHEADER}}', '', [readmeMdPath]);
    lightjs.replacement('{{PROJECT.READMEGETTINGSTARTED}}', '', [readmeMdPath]);
  }

  const twoEol = os.EOL + os.EOL;
  lightjs.replacement('{{PROJECT.USAGE}}', !swHelper.isJs() ? '## Usage' + twoEol + '### Modules' + twoEol : '', [readmeMdPath]);

  const clientLink = `For the client check [${projectConfig.general.name} - client](./client).` + twoEol;
  const serverLink = `For the server check [${projectConfig.general.name} - server](./server).`;
  const dockerLink = twoEol + `For the docker check [${projectConfig.general.name} - docker](./README_docker.md).`;
  lightjs.replacement('{{PROJECT.CLIENT}}', !swHelper.isJs() ? clientLink : '', [readmeMdPath]);
  lightjs.replacement('{{PROJECT.SERVER}}', !swHelper.isJs() ? serverLink : '', [readmeMdPath]);
  lightjs.replacement('{{PROJECT.DOCKER}}', projectConfig.general.useDocker ? dockerLink : '', [readmeMdPath]);
  lightjs.replacement('{{PROJECT.VERSION}}', packageJsonData.version, [readmeMdPath]);

  const clientConfig = projectConfig.client;
  const genaralConfig = projectConfig.general;
  const clientConfigRouting = clientConfig.routing;
  const serverConfig = projectConfig.server;
  const api = swHelper.isJavaKotlin() ? 'http://localhost:8080/' : (swHelper.isPhp() && serverConfig.serverAsApi ? './api/' : './');
  const apiSuffix = swHelper.isPhp() && !serverConfig.htaccess ? '`.php`' : 'EMPTY';

  const readmeFile = swHelper.isJs() ? readmeMdPath : path.join(projectPath, swConst.CLIENT, swConst.README_MD);

  const useMock = genaralConfig.useMock;
  replaceMockSection(useMock, 'MOCKMODE', ', `mockMode`', readmeFile);
  replaceMockSection(useMock, 'MOCKENV', os.EOL + 'cp src/environments/environment.ts src/environments/environment.mock.ts', readmeFile);
  replaceMockSection(useMock, 'MOCKSERVER', os.EOL + 'You can do this for example with `' + swHelper.yarnNpmCommand('run') + ' serve:mock`.', readmeFile);
  const mockRun = [
    os.EOL + os.EOL,
    'If you want to work with mock data, start the mock in a separate terminal, reachable on [http://localhost:3000/](http://localhost:3000/).',
    os.EOL + os.EOL,
    '```bash' + os.EOL,
    '# mock, separate terminal' + os.EOL,
    swHelper.yarnNpmCommand('run') + ' run:mock' + os.EOL,
    '```',
  ];
  const mockCommand = os.EOL + '# with mock' + os.EOL + swHelper.yarnNpmCommand('run');
  replaceMockSection(useMock, 'MOCKRUN', mockRun.join(''), readmeFile);
  replaceMockSection(useMock, 'MOCKBUILD', mockCommand + ' build:mock', readmeFile);
  replaceMockSection(useMock, 'MOCKSERVE', mockCommand + ' serve:mock', readmeFile);
  replaceMockSection(useMock, 'MOCKWATCH', mockCommand + ' watch:mock', readmeFile);
  replaceMockSection(useMock, 'MOCKCONFIG', ' and for mockMode the option `api` to `http://localhost:3000/`', readmeFile);

  lightjs.replacement('{{PROJECT.ACTIVATELOGIN}}', clientConfigRouting.login.activate, [readmeFile]);
  lightjs.replacement('{{PROJECT.API}}', api, [readmeFile]);
  lightjs.replacement('{{PROJECT.APISUFFIX}}', apiSuffix, [readmeFile]);
  lightjs.replacement('{{PROJECT.DEFAULTROUTE}}', clientConfigRouting.features.default, [readmeFile]);
  lightjs.replacement('{{PROJECT.REDIRECTNOTFOUND}}', clientConfigRouting.notFound.redirect, [readmeFile]);
  lightjs.replacement('{{PROJECT.SHOWFEATURES}}', clientConfigRouting.features.show, [readmeFile]);
  lightjs.replacement('{{PROJECT.SHOWLOGIN}}', clientConfigRouting.login.show, [readmeFile]);
  lightjs.replacement('{{PROJECT.THEME}}', clientConfig.theme, [readmeFile]);

  lightjs.replacement('(`themes\\.scss`\\.)\\n\\s*', '$1' + os.EOL, [readmeFile]);
  lightjs.replacement('{{PROJECT.USAGEYN}}', swHelper.yarnNpmCommand('run'), [readmeFile]);
}

function replaceMockSection(useMock, placeholder, replacement, file) {
  lightjs.replacement(`{{PROJECT.${placeholder}}}`, useMock ? replacement : '', [file]);
}

/**
 * Updates the header in the readme.
 *
 * @param {string} readmeMdPath
 */
function updateReadmeHeader(readmeMdPath) {
  const readmeHeaderData = fs.readFileSync(path.join(swConst.TEMPLATE_ROOT_README, 'README.header.md'), 'utf8');
  lightjs.replacement('{{PROJECT.READMEHEADER}}', updateReadmeHeaderSections(readmeHeaderData, true), [readmeMdPath]);
  if (!swHelper.isJs()) {
    shjs.cp(swConst.TEMPLATE_CLIENT_README, path.join(projectPath, swConst.CLIENT));
    lightjs.replacement('{{PROJECT.READMEHEADER}}', updateReadmeHeaderSections(readmeHeaderData, false), [path.join(projectPath, swConst.CLIENT, swConst.README_MD)]);
  }
}

/**
 * Updates the header sections in the readme.
 *
 * @param {string} readmeMdPath
 */
function updateReadmeHeaderSections(readmeHeaderData, isRoot) {
  readmeHeaderData = readmeHeaderData.replace('{{PROJECT.TITLE}}', projectConfig.general.title + (isRoot ? '' : ' - client'));
  readmeHeaderData = readmeHeaderData.replace('{{PROJECT.LICENSE}}', checkAndCreateLicense(isRoot));
  readmeHeaderData = readmeHeaderData.replace('{{PROJECT.DEPENDENCIES}}', checkAndCreateDependencies(isRoot));
  readmeHeaderData = readmeHeaderData.replace('{{PROJECT.DESCRIPTION}}', checkAndCreateDescription(isRoot));
  return readmeHeaderData;
}

/**
 * Checks for using a license and return a link.
 *
 * @param {boolean} isRoot
 */
function checkAndCreateLicense(isRoot) {
  return isRoot && isLicense() ? os.EOL + os.EOL + '[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)' : '';
}

/**
 * Checks for using and creating the dependency links.
 *
 * @param {boolean} isRoot
 */
function checkAndCreateDependencies(isRoot) {
  let result = '';
  if (projectConfig.client.ghUser !== '' && ((isRoot && swHelper.isJs()) || (!isRoot && !swHelper.isJs()))) {
    if (isRoot && isLicense()) {
      result = os.EOL + createDavidDmLinks(isRoot);
    } else if ((isRoot && !isLicense()) || !isRoot) {
      result = os.EOL + os.EOL + createDavidDmLinks(isRoot);
    }
  }
  return result;
}
/**
 * Creates the david dm links.
 *
 * @param {boolean} isRoot
 */
function createDavidDmLinks(isRoot) {
  const pathParam = isRoot ? '' : '?path=client';
  const davidDmLink = `https://david-dm.org/${projectConfig.client.ghUser}/${projectConfig.general.name}`;
  const dependenciesStatus = `[![dependencies Status](${davidDmLink}/status.svg${pathParam})](${davidDmLink}${pathParam})`;
  const typeParam = isRoot ? '?' : '&';
  const devDependenciesStatus = `[![devDependencies Status](${davidDmLink}/dev-status.svg${pathParam})](${davidDmLink}${pathParam}${typeParam}type=dev)`;
  return dependenciesStatus + os.EOL + devDependenciesStatus;
}

/**
 * Checks for using the description.
 *
 * @param {boolean} isRoot
 */
function checkAndCreateDescription(isRoot) {
  return isRoot ? os.EOL + os.EOL + projectConfig.general.description : os.EOL;
}

/**
 * Checks for using the MIT License.
 *
 * @param {boolean} isRoot
 */
function isLicense() {
  return projectConfig.general.useMITLicense;
}

/**
 * Checks for the used mananger.
 *
 * @param {string} manager
 */
function checkManager(manager) {
  const usedText = ', used in this repository';
  const useYarn = swHelper.useYarn();
  return useYarn && manager === swConst.YARN ? usedText : !useYarn && manager === swConst.NPM ? usedText + ', ' : '';
}

/**
 * Updates the getting started in the readme.
 *
 * @param {string} readmeMdPath
 */
function updateReadmeGettingStarted(readmeMdPath) {
  const readmeGettingStartedData = fs.readFileSync(path.join(swConst.TEMPLATE_ROOT_README, 'README.getting-started.md'), 'utf8');
  lightjs.replacement('{{PROJECT.READMEGETTINGSTARTED}}', updateReadmeGettingStartedSection(readmeGettingStartedData, true), [readmeMdPath]);
  if (!swHelper.isJs()) {
    const readmeMdClientPath = path.join(projectPath, swConst.CLIENT, swConst.README_MD);
    lightjs.replacement('{{PROJECT.READMEGETTINGSTARTED}}', updateReadmeGettingStartedSection(readmeGettingStartedData, false), [readmeMdClientPath]);
  }
}

/**
 * Updates the getting started section in the readme.
 *
 * @param {string} readmeGettingStartedData
 * @param {string} readmeMdPath
 */
function updateReadmeGettingStartedSection(readmeGettingStartedData, isRoot) {
  const cloneProcess = '# clone project' + os.EOL + 'git clone ' + projectConfig.client.packageJson.repository + os.EOL + 'cd ' + projectConfig.general.name;
  const installTools = '# install tools and frontend dependencies' + os.EOL + swHelper.yarnNpmCommand('install');
  const commandsClient = '# all commands used in ./client' + os.EOL + 'cd client';
  const twoEol = os.EOL + os.EOL;

  const gettingStarted = [
    isRoot ? cloneProcess : '',
    isRoot && swHelper.isJs() ? twoEol + installTools : '',
    !isRoot && !swHelper.isJs() ? commandsClient + twoEol + installTools : ''
  ];
  return readmeGettingStartedData.replace('{{PROJECT.GETTINGSTARTED}}', gettingStarted.join(''));
}

/**
 * Updates the prerequisites in the readme.
 *
 * @param {string} readmeMdPath
 */
function updatePrerequisites(readmeMdPath) {
  let prerequisites = '';
  const twoEol = os.EOL + os.EOL;
  if (swHelper.isPhp()) {
    prerequisites = twoEol + '### Apache and php' + twoEol + `* \`Apache 2.4\` or higher` + os.EOL + `* \`php 7.3\` or higher`;
  }
  if (projectConfig.general.useDocker) {
    prerequisites = twoEol + '### Docker' + twoEol + `* \`docker 19.03.5\` or higher` + os.EOL + `* \`docker-compose 1.25.0\` or higher`;
  }
  if (swHelper.isJava()) {
    prerequisites += twoEol + '### Java' + twoEol + `* \`jdk 11\` or higher`;
  }
  lightjs.replacement('{{PROJECT.PREREQUISITES}}', prerequisites, [readmeMdPath]);
}

exp.configure = configure;

module.exports = exp;
