'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../../const.js');

let backendPhp = {};

/**
 * Configures the backend for php.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function configure(config, projectPath) {
  const projectName = config.general.name;
  lightjs.info(`-> update webpack config and api-backend`);

  const configServer = config.server;
  const serverDir = configServer.serverAsApi ? swConst.API : swConst.SERVER;
  const srcMainPath = path.join(projectPath, serverDir, swConst.SRC_MAIN);
  const htaccess = configServer.htaccess;
  shjs.mkdir('-p', srcMainPath);
  const phpTemplatePath = 'src/template/server/backend/php';
  shjs.cp(path.join(phpTemplatePath, swConst.AUTH_PHP), srcMainPath);
  shjs.cp(path.join(phpTemplatePath, swConst.AUTH_SERVICE_PHP), srcMainPath);
  if (htaccess) {
    shjs.cp(path.join(phpTemplatePath, '.htaccess'), srcMainPath);
  }

  const authServicePath = path.join(projectPath, serverDir, swConst.SRC_MAIN, swConst.AUTH_SERVICE_PHP);
  lightjs.replacement(swConst.SW_USER, projectName, [authServicePath]);

  const webpackConfigPath = path.join(projectPath, swConst.CLIENT, swConst.WEBPACK_CONFIG_JS);
  shjs.cp(path.join(phpTemplatePath, swConst.WEBPACK_CONFIG_JS), webpackConfigPath);
  lightjs.replacement(swConst.API, serverDir, [webpackConfigPath]);

  const readmeMd = path.join(projectPath, serverDir, swConst.README_MD);
  shjs.cp(path.join(swConst.TEMPLATE_README, 'README.php.md'), readmeMd);
  if (configServer.serverAsApi) {
    lightjs.replacement(swConst.SERVER, swConst.API, [readmeMd]);
    lightjs.replacement(swConst.SERVER, swConst.API, [webpackConfigPath]);
  }
}

backendPhp.configure = configure;

module.exports = backendPhp;
