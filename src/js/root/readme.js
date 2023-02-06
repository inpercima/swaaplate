'use strict';

/* requirements */
const fs = require('fs');
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swProjectConst = require('./project.const');
const swHelper = require('./helper');
const swVersionConst = require('./version.const')

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
  const packageJsonData = lightjs.readJson(swProjectConst.PACKAGE_JSON);
  projectConfig = pConfig;
  projectPath = pPath;

  shjs.cp(path.join(swProjectConst.SRC_TEMPLATE_ROOT_README, swProjectConst.README_MD), projectPath);
  const readmeMdPath = path.join(projectPath, swProjectConst.README_MD);
  updateReadmeHeader(readmeMdPath);
  updatePrerequisites(readmeMdPath);

  lightjs.replacement('{{PROJECT.ANGULARCLIVERSION}}', swVersionConst.ANGULAR_CLI, [readmeMdPath]);
  lightjs.replacement('{{PROJECT.USENPM}}', checkManager(swProjectConst.NPM), [readmeMdPath]);
  lightjs.replacement('{{PROJECT.USEYARN}}', checkManager(swProjectConst.YARN), [readmeMdPath]);
  lightjs.replacement('{{PROJECT.NODEVERSION}}', swVersionConst.NODE, [readmeMdPath]);
  lightjs.replacement('{{PROJECT.NPMVERSION}}', swVersionConst.NPM, [readmeMdPath]);
  lightjs.replacement('{{PROJECT.YARNVERSION}}', swVersionConst.YARN, [readmeMdPath]);

  updateReadmeGettingStarted(readmeMdPath);

  const readmeFrontendData = swHelper.isNone() ? fs.readFileSync(swProjectConst.SRC_TEMPLATE_FRONTEND_README, 'utf8') : os.EOL;
  lightjs.replacement('{{PROJECT.READMEIMPORT}}', readmeFrontendData, [readmeMdPath]);
  if (swHelper.isNone()) {
    lightjs.replacement('{{PROJECT.READMEHEADER}}', '', [readmeMdPath]);
    lightjs.replacement('{{PROJECT.READMEGETTINGSTARTED}}', '', [readmeMdPath]);
  }

  const twoEol = os.EOL + os.EOL;
  lightjs.replacement('{{PROJECT.USAGE}}', !swHelper.isNone() ? '## Usage' + twoEol + '### Modules' + twoEol : '', [readmeMdPath]);

  const genaralConfig = projectConfig.general;
  const backendConfig = projectConfig.backend;
  const name = genaralConfig.name;
  const frontendLink = `For the frontend check [${name} - frontend](./frontend).` + twoEol;
  const backendFolder = swHelper.isPhp() && backendConfig.php.runAsApi ? swProjectConst.API : swProjectConst.BACKEND;
  const backendLink = `For the backend check [${name} - ${backendFolder}](./${backendFolder}).`;
  const dockerLink = twoEol + `For the docker check [${name} - docker](./README_docker.md).`;
  lightjs.replacement('{{PROJECT.FRONTEND}}', !swHelper.isNone() ? frontendLink : '', [readmeMdPath]);
  lightjs.replacement('{{PROJECT.BACKEND}}', !swHelper.isNone() ? backendLink : '', [readmeMdPath]);
  lightjs.replacement('{{PROJECT.DOCKER}}', genaralConfig.useDocker ? dockerLink : '', [readmeMdPath]);
  lightjs.replacement('{{PROJECT.VERSION}}', packageJsonData.version, [readmeMdPath]);

  const frontendConfig = projectConfig.frontend;
  const api = swHelper.isJavaKotlin() ? 'http://localhost:8080/' : (swHelper.isPhp() && backendConfig.php.runAsApi ? './api/' : './');

  const readmeFile = swHelper.isNone() ? readmeMdPath : path.join(projectPath, swProjectConst.FRONTEND, swProjectConst.README_MD);

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

  lightjs.replacement('{{PROJECT.API}}', api, [readmeFile]);
  lightjs.replacement('{{PROJECT.DEFAULTROUTE}}', frontendConfig.architecture.modules.features.firstComponent, [readmeFile]);
  lightjs.replacement('{{PROJECT.THEME}}', frontendConfig.theme, [readmeFile]);

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
  const readmeHeaderData = fs.readFileSync(path.join(swProjectConst.SRC_TEMPLATE_ROOT_README, 'README.header.md'), 'utf8');
  lightjs.replacement('{{PROJECT.READMEHEADER}}', updateReadmeHeaderSections(readmeHeaderData, true), [readmeMdPath]);
  if (!swHelper.isNone()) {
    shjs.cp(swProjectConst.SRC_TEMPLATE_FRONTEND_README, path.join(projectPath, swProjectConst.FRONTEND));
    lightjs.replacement('{{PROJECT.READMEHEADER}}', updateReadmeHeaderSections(readmeHeaderData, false), [path.join(projectPath, swProjectConst.FRONTEND, swProjectConst.README_MD)]);
  }
}

/**
 * Updates the header sections in the readme.
 *
 * @param {string} readmeMdPath
 */
function updateReadmeHeaderSections(readmeHeaderData, isRoot) {
  readmeHeaderData = readmeHeaderData.replace('{{PROJECT.TITLE}}', projectConfig.general.title + (isRoot ? '' : ' - frontend'));
  readmeHeaderData = readmeHeaderData.replace('{{PROJECT.LICENSE}}', checkAndCreateLicense(isRoot));
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
  const useYarn = swHelper.isYarn();
  return useYarn && manager === swProjectConst.YARN ? usedText : !useYarn && manager === swProjectConst.NPM ? usedText + ',' : '';
}

/**
 * Updates the getting started in the readme.
 *
 * @param {string} readmeMdPath
 */
function updateReadmeGettingStarted(readmeMdPath) {
  const readmeGettingStartedData = fs.readFileSync(path.join(swProjectConst.SRC_TEMPLATE_ROOT_README, 'README.getting-started.md'), 'utf8');
  lightjs.replacement('{{PROJECT.READMEGETTINGSTARTED}}', updateReadmeGettingStartedSection(readmeGettingStartedData, true), [readmeMdPath]);
  if (!swHelper.isNone()) {
    const readmeMdFrontendPath = path.join(projectPath, swProjectConst.FRONTEND, swProjectConst.README_MD);
    lightjs.replacement('{{PROJECT.READMEGETTINGSTARTED}}', updateReadmeGettingStartedSection(readmeGettingStartedData, false), [readmeMdFrontendPath]);
  }
}

/**
 * Updates the getting started section in the readme.
 *
 * @param {string} readmeGettingStartedData
 * @param {string} readmeMdPath
 */
function updateReadmeGettingStartedSection(readmeGettingStartedData, isRoot) {
  const cloneProcess = '# clone project' + os.EOL + 'git clone ' + projectConfig.frontend.packageJson.repository + os.EOL + 'cd ' + projectConfig.general.name;
  const installTools = '# install tools and frontend dependencies' + os.EOL + swHelper.yarnNpmCommand('install');
  const commandsFrontend = '# all commands used in ./frontend' + os.EOL + 'cd frontend';
  const twoEol = os.EOL + os.EOL;

  const gettingStarted = [
    isRoot ? cloneProcess : '',
    isRoot && swHelper.isNone() ? twoEol + installTools : '',
    !isRoot && !swHelper.isNone() ? commandsFrontend + twoEol + installTools : ''
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
    prerequisites = twoEol + '### Apache and php' + twoEol + '* `Apache ' + swVersionConst.APACHE + '` or higher' + os.EOL + '* `php ' + swVersionConst.PHP + '` or higher';
  }
  if (projectConfig.general.useDocker) {
    prerequisites = twoEol + '### Docker' + twoEol + '* `docker ' + swVersionConst.DOCKER + '` or higher' + os.EOL + '* `docker compose ' + swVersionConst.DOCKER_COMPOSE + '` or higher';
  }
  if (swHelper.isJava()) {
    prerequisites += twoEol + '### Java' + twoEol + '* `jdk ' + swVersionConst.JDK + '` or higher';
  }
  lightjs.replacement('{{PROJECT.PREREQUISITES}}', prerequisites, [readmeMdPath]);
}

exp.configure = configure;

module.exports = exp;
