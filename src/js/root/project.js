'use strict';

/* requirements */
const axios = require('axios');
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swBackend = require('../server/backend');
const swConst = require('./const.js');
const swFrontend = require('../client/frontend');
const swHelper = require('./helper');
const swManagement = require('../server/management');
const swReadme = require('./readme');

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
  swHelper.configure(projectConfig);

  const projectName = projectConfig.general.name;
  projectPath = path.join(workspacePath, projectName);
  lightjs.info(`task: create project '${projectName}' in '${workspacePath}'`);

  swFrontend.configure(workspacePath, projectConfig, projectPath);
  swBackend.configure(projectConfig, projectPath);
  swManagement.configure(projectConfig, projectPath);
  swReadme.configure(projectConfig, projectPath);

  configure();
  updateEditorConfigFile();
  updateGitignoreFile();
  updateFiles();
}

/**
 * Configures and copy root files.
 *
 */
function configure() {
  lightjs.info('taks: configures and copy root files');

  const generalConfig = projectConfig.general;
  const templatePath = 'src/template/root';
  if (generalConfig.useMITLicense) {
    shjs.cp(path.join(templatePath, swConst.LICENSE_MD), projectPath);
    lightjs.replacement('{{PROJECT.YEAR}}', new Date().getFullYear(), [path.join(projectPath, swConst.LICENSE_MD)]);
  }
  shjs.cp(path.join(templatePath, swConst.DOT_EDITORCONFIG), projectPath);
  shjs.cp(path.join(templatePath, '.gitattributes'), projectPath);
  shjs.cp(swConst.SWAAPLATE_JSON, projectPath);

  if (generalConfig.useDocker) {
    shjs.cp(path.join(templatePath, swConst.DOCKER, swConst.DOCKERFILE), path.join(projectPath, swConst.DOCKERFILE));
    shjs.cp(path.join(templatePath, swConst.DOCKER, swConst.DOCKER_COMPOSE_YML), path.join(projectPath, swConst.DOCKER_COMPOSE_YML));
    shjs.cp(path.join(templatePath, swConst.DOCKER, swConst.README_MD), path.join(projectPath, 'README_docker.md'));
    shjs.cp(path.join(templatePath, swConst.DOCKER, 'default.env'), path.join(projectPath, 'default.env'));
    shjs.cp(path.join(templatePath, swConst.DOCKER, 'default.env'), path.join(projectPath, '.env'));
    lightjs.replacement('{{PROJECT.TITLE}}', generalConfig.name, [path.join(projectPath, swConst.DOCKER_COMPOSE_YML)]);
    const contributors = projectConfig.client.packageJson.contributors;
    const name = contributors[0].name ? contributors[0].name : '';
    const email = contributors[0].name ? contributors[0].email : '';
    lightjs.replacement('{{PROJECT.AUTHOR}}', name, [path.join(projectPath, swConst.DOCKERFILE)]);
    lightjs.replacement('{{PROJECT.FIRSTCONTRIBUTORSMAIL}}', email, [path.join(projectPath, swConst.DOCKERFILE)]);
  }
}

/**
 * Updates the editorconfig file with some data.
 *
 */
function updateEditorConfigFile() {
  if (isJavaKotlin()) {
    const backend = projectConfig.server.backend;
    const twoEol = os.EOL + os.EOL;
    const indentSize = backend === swConst.KOTLIN ? 2 : 4;
    const indention = `${twoEol}[*.${backend}]${os.EOL}indent_size = ${indentSize}`;
    lightjs.replacement('(trim_trailing_whitespace = true)', `$1${indention}`, [path.join(projectPath, swConst.DOT_EDITORCONFIG)]);
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
  const phpContent = swHelper.isPhp() ? 'config.dev.php' + os.EOL + 'config.prod.php' + os.EOL : '';
  const javaKotlinContent = isJavaKotlin() ? 'application-dev.yml' + os.EOL + 'application-prod.yml' + os.EOL : '';
  const mockContent = projectConfig.general.useMock ? 'environment.mock.ts' + os.EOL : '';
  const content = [
    `# begin project specific${os.EOL}`,
    `environment.dev.ts${os.EOL}${mockContent}environment.prod.ts${os.EOL}${phpContent}${javaKotlinContent}`,
    `# ignore all in \'.vscode\' b/c some vsc config files contain user specific content${os.EOL}.vscode/*${os.EOL}`,
    `# end project specific${os.EOL}${os.EOL}`
  ];
  const gitignoreUrl = swConst.GITIGNORE_URL + (isJavaKotlin() ? `,${backend},${serverConfig.javaKt.management}` : '');
  const gitignoreFilePath = path.join(projectPath, gitignoreFile);
  axios.get(gitignoreUrl).then(function (response) {
    lightjs.writeFile(gitignoreFilePath, `${content.join(os.EOL)}${response.data}`);
  });
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

/**
 * Updates the project.
 *
 * @param {string} pPath
 */
function update(pPath) {
  const pConfig = lightjs.readJson(path.join(pPath, swConst.SWAAPLATE_JSON));
  swHelper.configure(pConfig);
  lightjs.info(`update project '${pConfig.general.name}' in '${pPath}'`);

  swFrontend.updateDependencies(pPath);
}

exp.create = create;
exp.update = update;

module.exports = exp;
