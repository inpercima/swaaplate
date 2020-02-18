'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../const.js');

/**
 * Installs the dependencies for the client.
 *
 * @param {object} clientConfig
 * @param {string} backend
 * @param {string} projectPath
 */
function installDependencies(clientConfig, backend, projectPath) {
  if (clientConfig.installDependencies) {
    if (backend !== swConst.JS) {
      shjs.cd(path.join(projectPath, swConst.CLIENT));
    } else {
      shjs.cd(projectPath);
    }
    if (shjs.which('ng')) {
      shjs.exec('ng update --all --allowDirty=true --force=true');
    } else {
      lightjs.error(`sorry, this script requires 'ng'`);
      shjs.exit(1);
    }
  } else {
    lightjs.info('no dependencies will be installed');
  }
}

/**
 * Updates the package.json file with project data.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updatePackageFile(config, projectPath) {
  const packageJsonPath = path.join(projectPath, swConst.PACKAGE_JSON);
  lightjs.info(`${swConst.UPDATE} '${swConst.PACKAGE_JSON}'`);

  let packageJsonData = lightjs.readJson(packageJsonPath);
  const packageJsonConfig = config.client.packageJson;
  const generalConfig = config.general;
  packageJsonData.author = generalConfig.author;
  packageJsonData.contributors = packageJsonConfig.contributors;
  packageJsonData.description = generalConfig.description;
  const name = generalConfig.name;
  packageJsonData.name = name;

  const github = generalConfig.github;
  packageJsonData.repository = github.use ? `https://github.com/${github.username}/${name}` : packageJsonConfig.repository;
  const homepage = packageJsonConfig.homepage;

  packageJsonData.homepage = homepage === '' && packageJsonData.repository !== '' ? packageJsonData.repository : homepage;

  const configServer = config.server;
  if (configServer.backend === swConst.PHP) {
    packageJsonData.devDependencies['copy-webpack-plugin'] = swConst.COPY_WEBPACK_PLUGIN;
    packageJsonData.devDependencies['@angular-builders/custom-webpack'] = swConst.ANGULAR_BUILDERS;
    packageJsonData = updateTask(packageJsonData, 'build:mock');
    packageJsonData = updateTask(packageJsonData, 'watch:mock');
  }

  if (configServer.backend === swConst.JAVA || configServer.backend === swConst.KOTLIN) {
    packageJsonData.scripts['serve:dev'] = 'ng serve -o --configuration=dev';
  }

  packageJsonData.version = swConst.PROJECT_VERSION;
  lightjs.writeJson(packageJsonPath, packageJsonData);
}

/**
 * Updates a task in package.json.
 *
 * @param {object} packageJsonData
 * @param {string} mockTask
 */
function updateTask(packageJsonData, mockTask) {
  const task = packageJsonData.scripts[mockTask];
  packageJsonData.scripts[mockTask] = `export NODE_ENV='mock' && ${task}`;
  return packageJsonData;
}

/**
 * Updates the client readme file.
 *
 * @param {object} config
 * @param {object} projectPath
 */
function updateReadmeFile(config, projectPath) {
  const readmeMd = path.join(projectPath, swConst.CLIENT, swConst.README_MD);
  lightjs.info(`update '${readmeMd}'`);

  const generalConfig = config.general;
  const projectName = generalConfig.name;
  lightjs.replacement(swConst.SW_TITLE, projectName, [readmeMd]);

  // replace first part whic is in main readme
  lightjs.replacement(`${swConst.THIS_PROJECT}(.|\n)*(## Getting started)`, '$2', [readmeMd]);

  // replace license logo
  lightjs.replacement('\\[!\\[MIT.*\\s', '', [readmeMd]);
  lightjs.replacement('(status.svg)', '$1?path=client', [readmeMd]);
  lightjs.replacement(`(/${generalConfig.name})\\)`, '$1?path=client)', [readmeMd]);
  lightjs.replacement('\\?(type=dev)', '?path=client&$1', [readmeMd]);

  lightjs.replacement('# clone project', `# all commands used in ./${swConst.CLIENT}`, [readmeMd]);
  lightjs.replacement(`${swConst.GIT_CLONE}\\s(cd).*`, `$3 ${swConst.CLIENT}`, [readmeMd]);

  const github = generalConfig.github;
  if (github.use) {
    lightjs.replacement('inpercima', github.username, [readmeMd]);
  } else {
    lightjs.replacement(swConst.DEPENDENCY_LOGOS, '', [readmeMd]);
  }

  const clientConfig = config.client;
  if (!clientConfig.useYarn) {
    // replace yarn with npm in getting started section
    lightjs.replacement('(dependencies\\s)(yarn)', `$1npm install`, [readmeMd]);

    // replace all other occurrences of yarn with npm
    lightjs.replacement('yarn (.*:)', `npm run $1`, [readmeMd]);
  }

  const theme = clientConfig.theme;
  if (theme !== swConst.THEME) {
    lightjs.replacement(`(${swConst.DEFAULT}: )\`${swConst.THEME}\``, `$1\`${theme}\``, [readmeMd]);
  }

  const defaultRoute = clientConfig.routing.features.default;
  if (defaultRoute !== swConst.DASHBOARD) {
    lightjs.replacement(`\`${swConst.DASHBOARD}\``, `\`${defaultRoute}\``, [readmeMd]);
  }

  lightjs.replacement(`(# ${projectName})`, `$1 - ${swConst.CLIENT}`, [readmeMd]);

  const backend = config.server.backend;
  if (backend === swConst.JAVA || backend === swConst.KOTLIN) {
    lightjs.replacement(`(${swConst.DEFAULT}: )\`./\``, `$1\`http://localhost:8080/\``, [readmeMd]);
  }

  if (backend === swConst.PHP) {
    if (!config.server.htaccess) {
      lightjs.replacement(`(${swConst.DEFAULT}: )EMPTY`, `$1\`.php\``, [readmeMd]);
    }

    if (config.server.serverAsApi) {
      lightjs.replacement(`(${swConst.DEFAULT}: )\`./\``, `$1\`./api/\``, [readmeMd]);
    }
  }
}

let exp = {};
exp.projectConfig = {};
exp.projectPath = '';

exp.installDependencies = installDependencies;
exp.updatePackageFile = updatePackageFile;
exp.updateReadmeFile = updateReadmeFile;

module.exports = exp;
