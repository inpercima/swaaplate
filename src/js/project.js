'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const request = require('request');
const shjs = require('shelljs');

const swComponent = require('./client/component.js');
const swConst = require('./const.js');
const swBackend = require('./server/backend.js');
const swManagement = require('./server/management.js');

let project = {};

/**
 * Creates the project.
 *
 * @param {string} workspacePath
 */
function create(workspacePath) {
  const config = lightjs.readJson(swConst.SWAAPLATE_JSON);
  const projectName = config.packageJson.name;
  const projectPath = path.join(workspacePath, projectName);
  lightjs.info(`create project '${projectName}' in '${workspacePath}'`);

  swComponent.copyFiles(projectPath);
  updateGeneralProjectFiles(config, projectPath);
  updateMockFiles(config.packageJson.name, projectPath);
  swComponent.updatePackageFile(config, projectPath);
  swComponent.updateEnvironmentFiles(config, projectPath);
  swComponent.updateTestFiles(config, projectPath);
  swComponent.updateAngularFile(config, projectPath);

  swBackend.configure(config, projectPath);
  swManagement.configure(config, projectPath);
  swComponent.updateComponentFiles(config, projectPath);

  updateReadmeFile(config, projectPath);
  if (config.server.backend !== swConst.JS) {
    swComponent.updateReadmeFile(config, projectPath);
    swBackend.updateReadmeFile(config, projectPath);
  }

  updatePlaceholder(config, projectPath);

  swComponent.installDependencies(config.general, config.server.backend, projectPath);
}

/**
 * Updates the general project files with data from config.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updateGeneralProjectFiles(config, projectPath) {
  lightjs.info(`update '${swConst.DOT_GITIGNORE}' and '${swConst.LICENSE_MD}'`);

  const gitignoreFile = path.join(projectPath, swConst.DOT_GITIGNORE);

  const serverConfig = config.server;
  const backend = serverConfig.backend;
  if (backend === swConst.JAVA || backend === swConst.KOTLIN) {
    request(`${swConst.GITIGNORE_URL},${backend},${serverConfig.management}`, function (error, response, body) {
      lightjs.replacement(swConst.GITIGNORE_BODY, body, [gitignoreFile]);
      lightjs.replacement(swConst.ENV_FILE, `$1${os.EOL}${swConst.APPLICATION_DEV_YML}${os.EOL}${swConst.APPLICATION_PROD_YML}`, [gitignoreFile]);
    });
  } else {
    request(`${swConst.GITIGNORE_URL}`, function (error, response, body) {
      lightjs.replacement(swConst.GITIGNORE_BODY, body, [gitignoreFile]);
    });
  }

  const author = config.packageJson.author;
  if (author !== swConst.SW_AUTHOR) {
    lightjs.replacement(swConst.SW_AUTHOR, author, [path.join(projectPath, swConst.LICENSE_MD)]);
  }

  const docker = config.general.useDocker;
  if (docker) {
    shjs.touch(path.join(projectPath, "Dockerfile"));
    shjs.touch(path.join(projectPath, "docker-compose.yml"));
  }
}

/**
 * Updates the mock files with data from config.
 *
 * @param {string} title
 * @param {string} projectPath
 */
function updateMockFiles(title, projectPath) {
  const dbJsonFile = path.join(swConst.MOCK_DIR, swConst.DB_JSON);
  const middlewareJsFile = path.join(swConst.MOCK_DIR, swConst.MIDDLEWARE_JS);
  lightjs.info(`update '${dbJsonFile}' and '${middlewareJsFile}'`);

  const dbJson = path.join(projectPath, dbJsonFile);
  const dbJsonData = lightjs.readJson(dbJson);
  dbJsonData.users[0].username = title;
  dbJsonData.users[0].password = title;
  lightjs.writeJson(dbJson, dbJsonData);

  lightjs.replacement(swConst.SW_TITLE, title, [path.join(projectPath, middlewareJsFile)]);
}

/**
 * Updates the general README.md file.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updateReadmeFile(config, projectPath) {
  const twoEol = os.EOL + os.EOL;
  const serverConfig = config.server;
  const packageJson = config.packageJson;
  const readmeMd = path.join(projectPath, swConst.README_MD);
  const packageJsonData = lightjs.readJson(swConst.PACKAGE_JSON);
  const description = `${packageJson.description}${twoEol}${swConst.SW_GENERATED} ${packageJsonData.version}.`;
  lightjs.info(`update '${readmeMd}'`);

  if (serverConfig.backend !== swConst.JS) {
    shjs.cp(readmeMd, path.join(projectPath, swConst.CLIENT, swConst.README_MD));

    const usage = `## Usage${twoEol}### Modules${twoEol}`;
    const clientUsage = createUsageLink(config.packageJson, config.general, swConst.CLIENT);
    const serverOrApi = serverConfig.serverAsApi && serverConfig.backend === swConst.PHP ? swConst.API : swConst.SERVER;
    const serverUsage = createUsageLink(config.packageJson, config.general, serverOrApi);
    lightjs.replacement(swConst.README_MAIN, `\`\`\`${twoEol}${usage}${clientUsage}${twoEol}${serverUsage}${os.EOL}`, [readmeMd]);
  }

  if (serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN) {
    const javaCamelCase = swConst.JAVA.charAt(0).toUpperCase() + swConst.JAVA.slice(1);
    lightjs.replacement(swConst.REQUIREMENT, `### ${javaCamelCase}${twoEol}* \`jdk 8\` ${swConst.OR_HIGHER}${twoEol}$1`, [readmeMd]);
  }

  // append line in dependency table for copy-webpack-plugin if backend php
  if (serverConfig.backend === swConst.PHP) {
    const row = `| copy-webpack-plugin | ${swConst.COPY_WEBPACK_PLUGIN} | 5.0.3 | copy-webpack-plugin@5.0.3" has unmet peer dependency "webpack@^4.0.0" |`;
    lightjs.replacement(swConst.REASON, `$1${os.EOL}${row}`, [readmeMd]);
    const apache = `* \`${swConst.APACHE} 2.4\` ${swConst.OR_HIGHER}`;
    const php = `* \`${swConst.PHP} 7.3\` ${swConst.OR_HIGHER}`;
    lightjs.replacement(swConst.REQUIREMENT, `### ${swConst.APACHE} and ${swConst.PHP}${twoEol}${apache}${os.EOL}${php}${twoEol}$1`, [readmeMd]);
  }

  if (!config.general.useYarn) {
    lightjs.replacement(`${swConst.OR_HIGHER},.*`, swConst.OR_HIGHER, [readmeMd]);
    lightjs.replacement(`${swConst.OR_HIGHER} or`, `${swConst.OR_HIGHER}, used in this repository, or`, [readmeMd]);
  }

  if (config.general.useDocker) {
    const docker = `* \`docker ${swConst.DOCKER_VERSION}\` ${swConst.OR_HIGHER}${os.EOL}* \`docker-compose ${swConst.DOCKER_COMPOSE_VERSION}\``;
    lightjs.replacement(swConst.REQUIREMENT, `### Docker${twoEol}${docker} ${swConst.OR_HIGHER}${twoEol}$1`, [readmeMd]);
  }

  // replace dependency logos
  lightjs.replacement(swConst.DEPENDENCY_LOGOS, '', [readmeMd]);

  // replace the first sentence
  lightjs.replacement(swConst.THIS_PROJECTS, '', [readmeMd]);
  // replace the second sentence
  lightjs.replacement(swConst.THIS_PROJECT, description, [readmeMd]);

  lightjs.replacement(swConst.SW_TITLE, packageJson.name, [readmeMd]);
  lightjs.replacement(swConst.GIT_CLONE, `$1${packageJson.repository}`, [readmeMd]);
}

function createUsageLink(packageJson, generalConfig, type) {
  const url = generalConfig.github.use ? `https://github.com/${generalConfig.github.username}/${packageJson.name}/tree/master` : '';
  return `For the ${type} check [${packageJson.name} - ${type}](${url}/${type}).`;
}

function updatePlaceholder(config, projectPath) {
  lightjs.replacement('{{SPRING.BOOT.VERSION}}', swConst.SPRING_BOOT, [projectPath], true, true);
  lightjs.replacement('{{GROUP.ID}}', config.server.packagePath, [projectPath], true, true);
  lightjs.replacement('{{PROJECT.TITLE}}', config.general.title, [projectPath], true, true);
  lightjs.replacement('{{PROJECT.VERSION}}', '0.0.1-SNAPSHOT', [projectPath], true, true);
  lightjs.replacement('{{PROJECT.NAME}}', config.packageJson.name, [projectPath], true, true);
  lightjs.replacement('{{PROJECT.DESCRIPTION}}', config.packageJson.description, [projectPath], true, true);
  lightjs.replacement('{{PROJECT.DIST}}', config.general.buildWebDir, [projectPath], true, true);
}

project.create = create;

module.exports = project;