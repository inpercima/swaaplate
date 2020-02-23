'use strict';

/* requirements */
const axios = require('axios');
const fs = require('fs');
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swClient = require('./client/index.js');
const swConst = require('./const.js');
const swManagement = require('./server/management.js');
const swServer = require('./server/index.js');

let exp = {};
let projectConfig = {};
let projectPath = '';

/**
 * Create the project.
 *
 * @param {string} workspacePath
 */
function create(workspacePath) {
  projectConfig = lightjs.readJson(swConst.SWAAPLATE_JSON);
  const projectName = projectConfig.general.name;
  projectPath = path.join(workspacePath, projectName);
  lightjs.info(`create project '${projectName}' in '${workspacePath}'`);

  swClient.configure(workspacePath, projectConfig, projectPath);
  swServer.configure(projectConfig, projectPath);
  swManagement.configure(projectConfig, projectPath);

  copyFiles();
  updateGitignoreFile();
  updateReadmeFiles();
  updateFiles();
}

/**
 * Copy files for root.
 *
 */
function copyFiles() {
  lightjs.info('copy root files');

  const generalConfig = projectConfig.general;
  const templatePath = 'src/template/root';
  if (generalConfig.useMITLicense) {
    shjs.cp(path.join(templatePath, swConst.LICENSE_MD), projectPath);
    lightjs.replacement('{{PROJECT.YEAR}}', new Date().getFullYear(), [path.join(projectPath, swConst.LICENSE_MD)]);
  }
  shjs.cp(path.join(templatePath, swConst.DOT_EDITORCONFIG), projectPath);
  shjs.cp(path.join(templatePath, swConst.DOT_GITATTRIBUTES), projectPath);
  shjs.cp(swConst.SWAAPLATE_JSON, projectPath);

  if (generalConfig.useDocker) {
    shjs.touch(path.join(projectPath, swConst.DOCKERFILE));
    shjs.touch(path.join(projectPath, swConst.DOCKER_COMPOSE_YML));
  }
}

/**
 * Update the gitignore file created by angular-cli.
 *
 */
function updateGitignoreFile() {
  const serverConfig = projectConfig.server;
  const backend = serverConfig.backend;
  const javaKotlinContent = `${os.EOL}${swConst.APPLICATION_DEV_YML}${os.EOL}${swConst.APPLICATION_PROD_YML}`;
  const serverContent = backend === swConst.JAVA || backend === swConst.KOTLIN ? javaKotlinContent : '';
  const content = `# begin project specific

environment.dev.ts
environment.mock.ts
environment.prod.ts${serverContent}

# ignore all in '.vscode' b/c some vsc config files contain user specific content
.vscode/*

# end project specific`;
  const gitignoreFile = '.gitignore';
  lightjs.info(`${swConst.UPDATE} '${gitignoreFile}'`);

  const gitignoreUrl = 'https://www.gitignore.io/api/node,angular,eclipse,intellij+all';
  const gitignoreFilePath = path.join(projectPath, gitignoreFile);
  if (backend === swConst.JAVA || backend === swConst.KOTLIN) {
    axios.get(`${gitignoreUrl},${backend},${serverConfig.management}`).then(function (response) {
      lightjs.writeFile(gitignoreFilePath, `${content}${os.EOL}${response.data}`);
    });
  } else {
    axios.get(gitignoreUrl).then(function (response) {
      lightjs.writeFile(gitignoreFilePath, `${content}${os.EOL}${response.data}`);
    });
  }
}

/**
 * Replace project specific values global.
 *
 */
function updateFiles() {
  const generalConfig = projectConfig.general;
  lightjs.replacement('{{PROJECT.AUTHOR}}', generalConfig.author, [projectPath], true, true, 'node_modules');
  lightjs.replacement('{{PROJECT.DESCRIPTION}}', generalConfig.description, [projectPath], true, true, 'node_modules');
  lightjs.replacement('{{PROJECT.NAME}}', generalConfig.name, [projectPath], true, true, 'node_modules');
  lightjs.replacement('{{PROJECT.TITLE}}', generalConfig.title, [projectPath], true, true, 'node_modules');
}

/**
 * Update readme files.
 *
 */
function updateReadmeFiles() {
  const templatePath = 'src/template/root/readme/';
  shjs.cp(path.join(templatePath, swConst.README_MD), projectPath);
  const readmeMdPath = path.join(projectPath, swConst.README_MD);
  const readmeHeaderMdData = fs.readFileSync(path.join(templatePath, 'README.header.md'), 'utf8');
  lightjs.replacement('{{PROJECT.READMEHEADER}}', updateReadmeHeaderRoot(readmeHeaderMdData, true), [readmeMdPath]);
  if (projectConfig.server.backend !== swConst.JS) {
    shjs.cp(path.join('src/template/client/', swConst.README_MD), path.join(projectPath, swConst.CLIENT));
    lightjs.replacement('{{PROJECT.READMEHEADER}}', updateReadmeHeaderRoot(readmeHeaderMdData, false), [path.join(projectPath, swConst.CLIENT, swConst.README_MD)]);
  }
}

function updateReadmeHeaderRoot(readmeHeaderMdData, isRoot) {
  readmeHeaderMdData = readmeHeaderMdData.replace('{{PROJECT.TITLE}}', projectConfig.general.title);
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
  let dependencies = '';
  const ghUser = projectConfig.client.ghUser;
  if (ghUser !== '') {
    const projectName = projectConfig.general.name;
    const davidDmLink = `https://david-dm.org/${ghUser}/${projectName}`;
    const dependenciesStatus = `[![dependencies Status](${davidDmLink}/status.svg)](${davidDmLink})`;
    const devDependenciesStatus = `[![devDependencies Status](${davidDmLink}/dev-status.svg)](${davidDmLink}?type=dev)`;
    const useDavidDm = (isRoot && projectConfig.server.backend === swConst.JS) || (!isRoot && projectConfig.server.backend !== swConst.JS);
    dependencies = useDavidDm ? dependenciesStatus + os.EOL + devDependenciesStatus : '';
  }
  return dependencies;
}

exp.create = create;

module.exports = exp;
