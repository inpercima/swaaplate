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
 * Determine the client folder.
 *
 */
function getClientFolder() {
  return projectConfig.server.backend === swConst.JS ? '' : swConst.CLIENT;
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
 * Updates the mock files with data from config.
 *
 * @param {string} title
 * @param {string} projectPath
 * @param {string} backend
 * @param {boolean} update
 */
function updateMockFiles(title, projectPath, backend, update) {
  const dbJsonFileTile = path.join(swConst.MOCK_DIR, swConst.DB_JSON);
  const middlewareJsFile = path.join(swConst.MOCK_DIR, swConst.MIDDLEWARE_JS);
  lightjs.info(`${swConst.UPDATE} '${dbJsonFileTile}' and '${middlewareJsFile}'`);

  const clientPath = path.join(projectPath, backend !== swConst.JS && update ? swConst.CLIENT : '');
  const dbJsonFile = path.join(clientPath, dbJsonFileTile);
  const dbJsonData = lightjs.readJson(dbJsonFile);
  dbJsonData.users[0].username = title;
  dbJsonData.users[0].password = title;
  lightjs.writeJson(dbJsonFile, dbJsonData);

  lightjs.replacement(swConst.SW_TITLE, title, [path.join(clientPath, middlewareJsFile)]);
}

/**
 * Updates the general README.md file.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updateReadmeFile(config, projectPath) {
  const twoEol = `${os.EOL}${os.EOL}`;
  const generalConfig = config.general;
  const readmeMd = path.join(projectPath, swConst.README_MD);
  const packageJsonData = lightjs.readJson(swConst.PACKAGE_JSON);
  const description = `${generalConfig.description}${twoEol}${swConst.SW_GENERATED} ${packageJsonData.version}.`;
  lightjs.info(`update '${readmeMd}'`);

  const serverConfig = config.server;
  if (serverConfig.backend !== swConst.JS) {
    shjs.cp(readmeMd, path.join(projectPath, swConst.CLIENT, swConst.README_MD));

    const usage = `## Usage${twoEol}### Modules${twoEol}`;
    const clientUsage = createUsageLink(generalConfig, swConst.CLIENT);
    const serverOrApi = serverConfig.serverAsApi && serverConfig.backend === swConst.PHP ? swConst.API : swConst.SERVER;
    const serverUsage = createUsageLink(generalConfig, serverOrApi);
    lightjs.replacement('\\s# install.*(.|\\n)*To create.*\\s*', `\`\`\`${twoEol}${usage}${clientUsage}${twoEol}${serverUsage}${os.EOL}`, [readmeMd]);
  }

  if (serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN) {
    const javaCamelCase = swConst.JAVA.charAt(0).toUpperCase() + swConst.JAVA.slice(1);
    lightjs.replacement(swConst.REQUIREMENT, `### ${javaCamelCase}${twoEol}* \`jdk 11\` ${swConst.OR_HIGHER}${twoEol}$1`, [readmeMd]);
  }

  // append line in dependency table for copy-webpack-plugin if backend php
  if (serverConfig.backend === swConst.PHP) {
    const row = `| copy-webpack-plugin | ${swConst.COPY_WEBPACK_PLUGIN} | 5.1.1 | copy-webpack-plugin@5.1.1" has unmet peer dependency "webpack@^4.0.0 \|\| ^5.0.0" |`;
    lightjs.replacement('(\\| ------ \\|)', `$1${os.EOL}${row}`, [readmeMd]);
    const apache = `* \`${swConst.APACHE} 2.4\` ${swConst.OR_HIGHER}`;
    const php = `* \`${swConst.PHP} 7.3\` ${swConst.OR_HIGHER}`;
    lightjs.replacement(swConst.REQUIREMENT, `### ${swConst.APACHE} and ${swConst.PHP}${twoEol}${apache}${os.EOL}${php}${twoEol}$1`, [readmeMd]);
  }

  if (!config.client.useYarn) {
    lightjs.replacement(`${swConst.OR_HIGHER},.*`, swConst.OR_HIGHER, [readmeMd]);
    lightjs.replacement(`${swConst.OR_HIGHER} or`, `${swConst.OR_HIGHER}, used in this repository, or`, [readmeMd]);
  }

  if (generalConfig.useDocker) {
    const docker = `* \`docker ${swConst.DOCKER_VERSION}\` ${swConst.OR_HIGHER}${os.EOL}* \`docker-compose ${swConst.DOCKER_COMPOSE_VERSION}\``;
    lightjs.replacement(swConst.REQUIREMENT, `### Docker${twoEol}${docker} ${swConst.OR_HIGHER}${twoEol}$1`, [readmeMd]);
  }

  // replace dependency logos
  if (serverConfig.backend !== swConst.JS) {
    lightjs.replacement(swConst.DEPENDENCY_LOGOS, '', [readmeMd]);
  }

  // replace the first sentence
  lightjs.replacement('This.+projects.\\s*', '', [readmeMd]);
  // replace the second sentence
  lightjs.replacement(swConst.THIS_PROJECT, description, [readmeMd]);

  lightjs.replacement(swConst.SW_TITLE, generalConfig.name, [readmeMd]);
  lightjs.replacement(swConst.GIT_CLONE, `$1${config.client.packageJson.repository}`, [readmeMd]);
}

/**
 * Creates links for usage.
 *
 * @param {object} generalConfig
 * @param {string} type
 */
function createUsageLink(generalConfig, type) {
  const url = generalConfig.github.use ? `https://github.com/${generalConfig.github.username}/${generalConfig.name}/tree/master` : '';
  return `For the ${type} check [${generalConfig.name} - ${type}](${url}/${type}).`;
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

/**
 * Updates the project.
 *
 */
function update() {
  const config = lightjs.readJson(path.join(projectPath, swConst.SWAAPLATE_JSON));
  const projectName = config.general.name;
  const serverConfig = config.server;
  lightjs.info(`update project '${projectName}' in '${projectPath}'`);

  swComponent.copyFilesForUpdate(projectPath, serverConfig.backend);
  swComponent.updateTestFiles(config, projectPath, true);
  updateMockFiles(projectName, projectPath, serverConfig.backend, true);
  swComponent.replaceSelectorPrefix(config.client.selectorPrefix, projectPath, serverConfig.backend);

  // update swaaplate version in readme
  const readmeMd = path.join(projectPath, swConst.README_MD);
  const packageJsonData = lightjs.readJson(swConst.PACKAGE_JSON);
  lightjs.replacement('This project was generated with.+', `${swConst.SW_GENERATED} ${packageJsonData.version}.`, [readmeMd]);

  swComponent.installDependencies(config.client, serverConfig.backend, projectPath);
}

exp.create = create;
exp.update = update;

module.exports = exp;
