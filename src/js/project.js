'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const request = require('request');
const shjs = require('shelljs');

const swBackend = require('./server/backend.js');
const swComponent = require('./client/component.js');
const swConst = require('./const.js');
const swManagement = require('./server/management.js');

let project = {};

/**
 * Creates the project.
 *
 * @param {string} workspacePath
 */
function create(workspacePath) {
  const config = lightjs.readJson(swConst.SWAAPLATE_JSON);
  const projectName = config.general.name;
  const projectPath = path.join(workspacePath, projectName);
  lightjs.info(`create project '${projectName}' in '${workspacePath}'`);

  swComponent.copyFiles(projectPath);
  updateGeneralProjectFiles(config, projectPath);
  updateMockFiles(projectName, projectPath);
  swComponent.updatePackageFile(config, projectPath);
  swComponent.updateEnvironmentFiles(config, projectPath);
  swComponent.updateTestFiles(config, projectPath);
  swComponent.updateAngularFile(config, projectPath);

  swBackend.configure(config, projectPath);
  swManagement.configure(config, projectPath);
  swComponent.updateComponentFiles(config, projectPath);

  const serverConfig = config.server;
  updateReadmeFile(config, projectPath);
  if (serverConfig.backend !== swConst.JS) {
    swComponent.updateReadmeFile(config, projectPath);
    swBackend.updateReadmeFile(config, projectPath);
  }

  updatePlaceholder(config, projectPath);

  swComponent.installDependencies(config.client, serverConfig.backend, projectPath);
}

/**
 * Updates the general project files with data from config.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updateGeneralProjectFiles(config, projectPath) {
  lightjs.info(`${swConst.UPDATE} '${swConst.DOT_GITIGNORE}' and '${swConst.LICENSE_MD}'`);

  const gitignoreFile = path.join(projectPath, swConst.DOT_GITIGNORE);

  const serverConfig = config.server;
  const backend = serverConfig.backend;
  if (backend === swConst.JAVA || backend === swConst.KOTLIN) {
    request(`${swConst.GITIGNORE_URL},${backend},${serverConfig.management}`, function (error, response, body) {
      lightjs.replacement(swConst.GITIGNORE_BODY, body, [gitignoreFile]);
      lightjs.replacement('(environment.prod.ts)', `$1${os.EOL}${swConst.APPLICATION_DEV_YML}${os.EOL}${swConst.APPLICATION_PROD_YML}`, [gitignoreFile]);
    });
  } else {
    request(`${swConst.GITIGNORE_URL}`, function (error, response, body) {
      lightjs.replacement(swConst.GITIGNORE_BODY, body, [gitignoreFile]);
    });
  }

  const generalConfig = config.general;
  const author = generalConfig.author;
  if (author !== swConst.SW_AUTHOR) {
    lightjs.replacement(swConst.SW_AUTHOR, author, [path.join(projectPath, swConst.LICENSE_MD)]);
  }

  const docker = generalConfig.useDocker;
  if (docker) {
    shjs.touch(path.join(projectPath, swConst.DOCKERFILE));
    shjs.touch(path.join(projectPath, swConst.DOCKER_COMPOSE_YML));
  }
}

/**
 * Updates the mock files with data from config.
 *
 * @param {string} title
 * @param {string} projectPath
 */
function updateMockFiles(title, projectPath) {
  const dbJsonFileTile = path.join(swConst.MOCK_DIR, swConst.DB_JSON);
  const middlewareJsFile = path.join(swConst.MOCK_DIR, swConst.MIDDLEWARE_JS);
  lightjs.info(`${swConst.UPDATE} '${dbJsonFileTile}' and '${middlewareJsFile}'`);

  const dbJsonFile = path.join(projectPath, dbJsonFileTile);
  const dbJsonData = lightjs.readJson(dbJsonFile);
  dbJsonData.users[0].username = title;
  dbJsonData.users[0].password = title;
  lightjs.writeJson(dbJsonFile, dbJsonData);

  lightjs.replacement(swConst.SW_TITLE, title, [path.join(projectPath, middlewareJsFile)]);
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
    const row = `| copy-webpack-plugin | ${swConst.COPY_WEBPACK_PLUGIN} | 5.0.3 | copy-webpack-plugin@5.0.3" has unmet peer dependency "webpack@^4.0.0" |`;
    lightjs.replacement('(\\| ------ \\|)', `$1${os.EOL}${row}`, [readmeMd]);
    const apache = `* \`${swConst.APACHE} 2.4\` ${swConst.OR_HIGHER}`;
    const php = `* \`${swConst.PHP} 7.3\` ${swConst.OR_HIGHER}`;
    lightjs.replacement(swConst.REQUIREMENT, `### ${swConst.APACHE} and ${swConst.PHP}${twoEol}${apache}${os.EOL}${php}${twoEol}$1`, [readmeMd]);
  }

  if (!generalConfig.useYarn) {
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
 * Replaces project specific values globally.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updatePlaceholder(config, projectPath) {
  const generalConfig = config.general;
  lightjs.replacement('{{SPRING.BOOT.VERSION}}', swConst.SPRING_BOOT, [projectPath], true, true);
  lightjs.replacement('{{GROUP.ID}}', config.server.packagePath, [projectPath], true, true);
  lightjs.replacement('{{PROJECT.TITLE}}', generalConfig.title, [projectPath], true, true);
  lightjs.replacement('{{PROJECT.VERSION}}', swConst.PROJECT_VERSION, [projectPath], true, true);
  lightjs.replacement('{{PROJECT.NAME}}', generalConfig.name, [projectPath], true, true);
  lightjs.replacement('{{PROJECT.DESCRIPTION}}', generalConfig.description, [projectPath], true, true);
  lightjs.replacement('{{PROJECT.DIST}}', config.client.buildDir, [projectPath], true, true);
}

project.create = create;

module.exports = project;
