'use strict';

/* requirements */
const axios = require('axios');
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swClient = require('./client/index.js');
const swConst = require('./const.js');
const swManagement = require('./server/management.js');
const swReadme = require('./readme.js');
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
  swReadme.configure(projectConfig, projectPath);

  configure();
  updateGitignoreFile();
  updateFiles();

}

/**
 * Configures and copy root files.
 *
 */
function configure() {
  lightjs.info('configures and copy root files');

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
    shjs.cp(path.join(templatePath, swConst.DOCKER, swConst.DOCKERFILE), path.join(projectPath, swConst.DOCKERFILE));
    shjs.cp(path.join(templatePath, swConst.DOCKER, swConst.DOCKER_COMPOSE_YML), path.join(projectPath, swConst.DOCKER_COMPOSE_YML));
    shjs.cp(path.join(templatePath, swConst.DOCKER, swConst.README_MD), path.join(projectPath, 'README_docker.md'));
    lightjs.replacement('{{PROJECT.TITLE}}', generalConfig.name, [path.join(projectPath, swConst.DOCKER_COMPOSE_YML)]);
    const contributors = projectConfig.client.packageJson.contributors;
    const name = contributors[0].name ? contributors[0].name : '';
    const email = contributors[0].name ? contributors[0].email : '';
    lightjs.replacement('{{PROJECT.AUTHOR}}', name, [path.join(projectPath, swConst.DOCKERFILE)]);
    lightjs.replacement('{{PROJECT.FIRSTCONTRIBUTORSMAIL}}', email, [path.join(projectPath, swConst.DOCKERFILE)]);
  }
}

/**
 * Updates the gitignore file created by angular-cli.
 *
 */
function updateGitignoreFile() {
  const gitignoreFile = '.gitignore';
  lightjs.info(`${swConst.UPDATE} '${gitignoreFile}'`);

  const serverConfig = projectConfig.server;
  const backend = serverConfig.backend;
  const javaKotlinContent = swConst.APPLICATION_DEV_YML + os.EOL + swConst.APPLICATION_PROD_YML + os.EOL;
  const content = [
    `# begin project specific${os.EOL}`,
    `environment.dev.ts${os.EOL}environment.mock.ts${os.EOL}environment.prod.ts${os.EOL}${isJavaKotlin() ? javaKotlinContent : ''}`,
    `# ignore all in \'.vscode\' b/c some vsc config files contain user specific content${os.EOL}.vscode/*${os.EOL}`,
    `# end project specific`
  ];
  const gitignoreUrl = 'https://www.gitignore.io/api/node,angular,eclipse,intellij+all';
  const gitignoreFilePath = path.join(projectPath, gitignoreFile);
  if (isJavaKotlin()) {
    axios.get(`${gitignoreUrl},${backend},${serverConfig.management}`).then(function (response) {
      lightjs.writeFile(gitignoreFilePath, `${content.join(os.EOL)}${os.EOL}${response.data}`);
    });
  } else {
    axios.get(gitignoreUrl).then(function (response) {
      lightjs.writeFile(gitignoreFilePath, `${content.join(os.EOL)}${os.EOL}${response.data}`);
    });
  }
}

/**
 * Checks if backend is java or kotlin.
 *
 */
function isJavaKotlin() {
  const backend = projectConfig.server.backend;
  return backend === swConst.JAVA || backend === swConst.KOTLIN;
}

/**
 * Updates all files with project meta data.
 *
 */
function updateFiles() {
  lightjs.info(`${swConst.UPDATE} all files with project meta data`);

  const generalConfig = projectConfig.general;
  lightjs.replacement('{{PROJECT.AUTHOR}}', generalConfig.author, [projectPath], true, true, 'node_modules');
  lightjs.replacement('{{PROJECT.DESCRIPTION}}', generalConfig.description, [projectPath], true, true, 'node_modules');
  lightjs.replacement('{{PROJECT.NAME}}', generalConfig.name, [projectPath], true, true, 'node_modules');
  lightjs.replacement('{{PROJECT.TITLE}}', generalConfig.title, [projectPath], true, true, 'node_modules');
}

exp.create = create;

module.exports = exp;
