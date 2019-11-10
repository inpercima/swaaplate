'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');
const uppercamelcase = require('uppercamelcase');

const swConst = require('../const.js');

let component = {};

/**
 * Copies the files for the Angular client.
 *
 * @param {string} projectPath
 */
function copyFiles(projectPath) {
  shjs.mkdir('-p', projectPath);
  shjs.cp('-r', path.join(swConst.SW_MODULE, '*'), projectPath);
  shjs.cp(path.join(swConst.SW_MODULE, swConst.DOT_EDITORCONFIG), projectPath);
  shjs.cp(path.join(swConst.SW_MODULE, swConst.DOT_GITATTRIBUTES), projectPath);
  shjs.cp(path.join(swConst.SW_MODULE, swConst.DOT_GITIGNORE), projectPath);
  shjs.cp(swConst.SWAAPLATE_JSON, projectPath);
  shjs.rm(path.join(projectPath, swConst.YARN_LOCK));
  shjs.rm('-rf', path.join(projectPath, 'node_modules'));
}

/**
 * Installs the dependencies for the client.
 *
 * @param {object} generalConfig
 * @param {string} backend
 * @param {string} projectPath
 */
function installDependencies(generalConfig, backend, projectPath) {
  if (generalConfig.installDependencies) {
    const yarnOrNpm = generalConfig.useYarn ? swConst.YARN : swConst.NPM;
    lightjs.info(`install dependencies via ${yarnOrNpm}`);

    lightjs.setNpmDefault(!generalConfig.useYarn);
    if (backend !== swConst.JS) {
      shjs.cd(path.join(projectPath, swConst.CLIENT));
    }
    lightjs.yarnpm('install');
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
  const packageJsonConfig = config.packageJson;
  packageJsonData.author = packageJsonConfig.author;
  packageJsonData.contributors = packageJsonConfig.contributors;
  packageJsonData.description = packageJsonConfig.description;
  const name = packageJsonConfig.name;
  packageJsonData.name = name;

  const github = config.general.github;
  packageJsonData.repository = github.use ? `${swConst.GITHUB_URL}${github.username}/${name}` : packageJsonConfig.repository;
  const homepage = packageJsonConfig.homepage;

  packageJsonData.homepage = homepage === '' && packageJsonData.repository !== '' ? packageJsonData.repository : homepage;

  const configServer = config.server;
  if (configServer.backend === swConst.PHP) {
    packageJsonData.devDependencies['copy-webpack-plugin'] = swConst.COPY_WEBPACK_PLUGIN;
    packageJsonData.devDependencies[swConst.ANGULAR_BUILDERS_CUSTOM] = swConst.ANGULAR_BUILDERS;
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
  packageJsonData.scripts[mockTask] = `${swConst.EXPORT_MOCK} && ${task}`;
  return packageJsonData;
}

/**
 * Updates the environment files for the client.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updateEnvironmentFiles(config, projectPath) {
  const environmentPath = path.join(projectPath, swConst.SRC_ENVIRONMENTS);

  copyEnvironmentFiles(environmentPath);

  replaceInEnvironmentFile(config, environmentPath, swConst.ENVIRONMENT_TS);
  replaceInEnvironmentFile(config, environmentPath, swConst.ENVIRONMENT_DEV_TS);
  replaceInEnvironmentFile(config, environmentPath, swConst.ENVIRONMENT_MOCK_TS);
  replaceInEnvironmentFile(config, environmentPath, swConst.ENVIRONMENT_PROD_TS);
}

/**
 * Copies the environment files for the client.
 *
 * @param {string} environmentPath
 */
function copyEnvironmentFiles(environmentPath) {
  const envPath = path.join(environmentPath, swConst.ENVIRONMENT_TS);
  shjs.cp(envPath, path.join(environmentPath, swConst.ENVIRONMENT_DEV_TS));
  shjs.cp(envPath, path.join(environmentPath, swConst.ENVIRONMENT_MOCK_TS));
  shjs.cp(envPath, path.join(environmentPath, swConst.ENVIRONMENT_PROD_TS));
}

/**
 * Replaces content from config in the environment files.
 *
 * @param {object} config
 * @param {string} environmentPath
 * @param {string} environmentFile
 */
function replaceInEnvironmentFile(config, environmentPath, environmentFile) {
  const specifiedEnvironmentFile = path.join(environmentPath, environmentFile);
  lightjs.info(`${swConst.UPDATE} '${environmentFile}'`);

  const generalConfig = config.general;
  const routeConfig = config.route;
  lightjs.replacement(swConst.CONFIG_LOGIN, `$1${routeConfig.login.activate}`, [specifiedEnvironmentFile]);
  lightjs.replacement(swConst.SW_TITLE, generalConfig.title, [specifiedEnvironmentFile]);
  lightjs.replacement(swConst.DASHBOARD, routeConfig.default, [specifiedEnvironmentFile]);
  lightjs.replacement(swConst.CONFIG_REDIRECT, `$1${routeConfig.notFound.redirect}`, [specifiedEnvironmentFile]);
  lightjs.replacement(swConst.CONFIG_SHOW_FEATURES, `$1${routeConfig.features.show}`, [specifiedEnvironmentFile]);
  lightjs.replacement(swConst.CONFIG_SHOW_LOGIN, `$1${routeConfig.login.show}`, [specifiedEnvironmentFile]);
  lightjs.replacement(swConst.THEME, generalConfig.theme, [specifiedEnvironmentFile]);

  // remove first lines in environment.x.ts files
  if (environmentFile !== swConst.ENVIRONMENT_TS) {
    lightjs.replacement(swConst.ENV_TS_REMOVE_FIRST_LINES, '', [specifiedEnvironmentFile]);
    lightjs.replacement(swConst.ENV_EXPORT, '$1', [specifiedEnvironmentFile]);
  }
  // remove last lines in environment.prod.ts files
  if (environmentFile === swConst.ENVIRONMENT_PROD_TS) {
    lightjs.replacement(swConst.ENV_TS_REMOVE_LAST_LINES, '', [specifiedEnvironmentFile]);
    lightjs.replacement(swConst.ENV_SPECIAL_CHARS, `$1${os.EOL}${os.EOL}`, [specifiedEnvironmentFile]);
  }
  // replace api in all none mock files
  if (environmentFile !== swConst.ENVIRONMENT_MOCK_TS) {
    const serverConfig = config.server;
    const backend = serverConfig.backend;
    if (backend === swConst.PHP) {
      if (!serverConfig.htaccess) {
        lightjs.replacement(swConst.API_SUFFIX, `$1'.php'`, [specifiedEnvironmentFile]);
      }
      lightjs.replacement(swConst.API_PATH, serverConfig.serverAsApi ? swConst.API_PATH_PHP_ROOT_API : swConst.API_PATH_PHP_ROOT, [specifiedEnvironmentFile]);
    } else if (backend === swConst.JAVA || backend === swConst.KOTLIN) {
      lightjs.replacement(swConst.API_PATH, swConst.API_PATH_JAVA_KOTLIN, [specifiedEnvironmentFile]);
    }
  }
}

/**
 * Updates content from config in the test client files.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updateTestFiles(config, projectPath) {
  lightjs.info(`${swConst.UPDATE} ${swConst.APP_COMPONENT_SPEC_TS}', '${swConst.APP_E2E_SPEC_TS}' and '${swConst.APP_PO_TS}'`);

  const newTitle = config.general.title;
  if (newTitle !== swConst.SW_TITLE) {
    lightjs.replacement(swConst.SW_TITLE, newTitle, [path.join(projectPath, swConst.SRC_APP, swConst.APP_COMPONENT_SPEC_TS)]);
    lightjs.replacement(swConst.SW_TITLE, newTitle, [path.join(projectPath, swConst.SRC_TEST_CLIENT, swConst.APP_E2E_SPEC_TS)]);
  }
  const newName = config.packageJson.name;
  if (newName !== swConst.SW_TITLE) {
    lightjs.replacement(swConst.SW_TITLE, newName, [path.join(projectPath, swConst.KARMA_CONF_JS)]);
  }
  const prefix = config.general.selectorPrefix;
  if (prefix !== swConst.APP) {
    lightjs.replacement(swConst.APP_ROOT, `${prefix}$1`, [path.join(projectPath, swConst.SRC_TEST_CLIENT, swConst.APP_PO_TS)]);
  }
}

/**
 * Updates content from config in the angular.json file.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updateAngularFile(config, projectPath) {
  lightjs.info(`${swConst.UPDATE} '${swConst.ANGULAR_JSON}'`);

  const angularJson = path.join(projectPath, swConst.ANGULAR_JSON);
  lightjs.replacement(swConst.SW_TITLE, config.packageJson.name, [angularJson]);

  const generalConfig = config.general;
  const buildWebDir = generalConfig.buildWebDir ;
  if (buildWebDir !== swConst.DIST) {
    lightjs.replacement(`"${swConst.DIST}"`, `"${buildWebDir}"`, [angularJson]);
  }

  const theme = generalConfig.theme;
  if (theme !== swConst.THEME) {
    lightjs.replacement(swConst.THEME, theme, [path.join(projectPath, swConst.SRC, swConst.STYLES_CSS)]);
  }

  const selectorPrefix = generalConfig.selectorPrefix;
  if (selectorPrefix !== swConst.APP) {
    lightjs.replacement(`"${swConst.APP}"`, `"${selectorPrefix}"`, [angularJson]);
  }

  // extend webpack behaviour on php to copy php code
  if (config.server.backend === swConst.PHP) {
    lightjs.replacement(swConst.ANGULAR_DEVKIT_BROWSER, swConst.ANGULAR_BUILDERS_BROWSER, [angularJson]);
    lightjs.replacement(swConst.ANGULAR_DEVKIT_SERVER, swConst.ANGULAR_BUILDERS_SERVER, [angularJson]);
    const newLine = `${os.EOL}            `;
    lightjs.replacement(swConst.OUTPUT_PATH, `$1${newLine}"customWebpackConfig": {${newLine}  "path": "./webpack.config.js"${newLine}},`, [angularJson]);
  }
}

/**
 * Updates the components of the app.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updateComponentFiles(config, projectPath) {
  lightjs.info(`${swConst.UPDATE} components`);

  const routes = [swConst.DASHBOARD, swConst.LOGIN, 'not-found'];
  const routeConfig = config.route;
  const configRoutes = [routeConfig.default, routeConfig.login.name, routeConfig.notFound.name];
  const selectorPrefix = config.general.selectorPrefix;
  const appPath = path.join(projectPath, config.server.backend === swConst.JS ? '' : swConst.CLIENT);
  const appSrcPath = path.join(appPath, swConst.SRC);

  if (selectorPrefix !== swConst.APP) {
    lightjs.replacement('app-root', `${selectorPrefix}-root`, [
      path.join(appSrcPath, swConst.APP, swConst.APP_COMPONENT_TS),
      path.join(appSrcPath, swConst.INDEX_HTML)
    ]);
    const tslintJson = path.join(appPath, swConst.TSLINT_JSON);
    const tslintJsonData = lightjs.readJson(tslintJson);
    tslintJsonData.rules["directive-selector"] = [true, "attribute", selectorPrefix, "camelCase"];
    tslintJsonData.rules["component-selector"] = [true, "element", selectorPrefix, "kebab-case"];
    lightjs.writeJson(tslintJson, tslintJsonData);
  }
  for (let i = 0; i < routes.length; i++) {
    const template = `'${selectorPrefix}-${configRoutes[i]}'`;
    lightjs.replacement(`'${swConst.APP}-${routes[i]}'`, template, [path.join(appSrcPath, swConst.APP)], true, true);
    if (configRoutes[i] !== routes[i]) {
      updateComponent(appSrcPath, routes[i], configRoutes[i]);
    }
  }
}

/**
 * Updates one single component.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function updateComponent(appPath, oldName, newName) {
  lightjs.info(`${swConst.UPDATE} component '${oldName}' to '${newName}'`);

  const srcPath = path.join(appPath, swConst.APP, oldName === swConst.DASHBOARD ? 'features' : '');
  shjs.mv(path.join(srcPath, oldName), path.join(srcPath, newName));

  shjs.mv(path.join(srcPath, newName, `${oldName}.component.html`), path.join(srcPath, newName, `${newName}.component.html`));
  shjs.mv(path.join(srcPath, newName, `${oldName}.component.ts`), path.join(srcPath, newName, `${newName}.component.ts`));
  shjs.mv(path.join(srcPath, newName, `${oldName}.component.spec.ts`), path.join(srcPath, newName, `${newName}.component.spec.ts`));
  // changes not needed for dashboard
  if (oldName !== swConst.DASHBOARD) {
    shjs.mv(path.join(srcPath, newName, `${oldName}.module.ts`), path.join(srcPath, newName, `${newName}.module.ts`));
    shjs.mv(path.join(srcPath, newName, `${oldName}.module.spec.ts`), path.join(srcPath, newName, `${newName}.module.spec.ts`));
    shjs.mv(path.join(srcPath, newName, `${oldName}-routing.module.ts`), path.join(srcPath, newName, `${newName}-routing.module.ts`));
    shjs.mv(path.join(srcPath, newName, `${oldName}-routing.module.spec.ts`), path.join(srcPath, newName, `${newName}-routing.module.spec.ts`));
  }
  // changes not needed for login
  if (oldName !== swConst.LOGIN) {
    lightjs.replacement(`${oldName}`, `${newName}`, [path.join(srcPath, newName, `${newName}.component.html`)]);
  }

  const oldUpper = uppercamelcase(oldName);
  const newUpper = uppercamelcase(newName);
  lightjs.replacement(`${oldUpper}Component`, `${newUpper}Component`, [srcPath], true, true);
  lightjs.replacement(`${oldUpper}Module`, `${newUpper}Module`, [srcPath], true, true);
  lightjs.replacement(`${oldUpper}RoutingModule`, `${newUpper}RoutingModule`, [srcPath], true, true);
  lightjs.replacement(`${swConst.OLD_PART_1}${oldName}${swConst.OLD_PART_2}`, `$1${newName}$3`, [srcPath], true, true);
  lightjs.replacement(`${swConst.OLD_NEW_PART_1}${oldName}${swConst.OLD_NEW_PART_2}${newName}${swConst.OLD_NEW_PART_3}`, `$1${newName}$3`, [srcPath], true, true);

  lightjs.replacement(`${oldName}Module`, `${newName}Module`, [srcPath], true, true);
  lightjs.replacement(`${oldName}RoutingModule`, `${newName}RoutingModule`, [srcPath], true, true);

  // changes needed for login only after movement
  if (oldName === swConst.LOGIN) {
    lightjs.replacement('loginForm', `${newName}Form`, [path.join(srcPath, newName)]);
  }
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

  const packageJsonConfig = config.packageJson;
  const projectName = packageJsonConfig.name;
  lightjs.replacement(swConst.SW_TITLE, projectName, [readmeMd]);

  // replace first part whic is in main readme
  lightjs.replacement(`${swConst.THIS_PROJECT}(.|\n)*(## Getting started)`, '$2', [readmeMd]);

  // replace license logo
  lightjs.replacement('\\[!\\[MIT.*\\s', '', [readmeMd]);
  lightjs.replacement('(status.svg)', '$1?path=client', [readmeMd]);
  lightjs.replacement(`(/${config.packageJson.name})\\)`, '$1?path=client)', [readmeMd]);
  lightjs.replacement('\\?(type=dev)', '?path=client&$1', [readmeMd]);

  lightjs.replacement('# clone project', `# all commands used in ./${swConst.CLIENT}`, [readmeMd]);
  lightjs.replacement(`${swConst.GIT_CLONE}\\s(cd).*`, `$3 ${swConst.CLIENT}`, [readmeMd]);

  const github = config.general.github;
  if (github.use) {
    lightjs.replacement('inpercima', github.username, [readmeMd]);
  } else {
    lightjs.replacement(swConst.DEPENDENCY_LOGOS, '', [readmeMd]);
  }

  if (!config.general.useYarn) {
      // replace yarn with npm in getting started section
    lightjs.replacement('(dependencies\\s)(yarn)', `$1npm install`, [readmeMd]);

    // replace all other occurrences of yarn with npm
    lightjs.replacement('yarn (.*:)', `npm run $1`, [readmeMd]);
  }

  const theme = config.general.theme;
  if (theme !== swConst.THEME) {
    lightjs.replacement(`(${swConst.DEFAULT}: )\`${swConst.THEME}\``, `$1\`${theme}\``, [readmeMd]);
  }

  const defaultRoute = config.route.default;
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

component.copyFiles = copyFiles;
component.installDependencies = installDependencies;
component.updatePackageFile = updatePackageFile;
component.updateEnvironmentFiles = updateEnvironmentFiles;
component.updateTestFiles = updateTestFiles;
component.updateAngularFile = updateAngularFile;
component.updateComponentFiles = updateComponentFiles;
component.updateReadmeFile = updateReadmeFile;

module.exports = component;
