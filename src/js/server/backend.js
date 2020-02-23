'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../const.js');

let exp = {};

/**
 * Configures the backend for Java or Kotlin.
 *
 * @param {object} projectConfig
 * @param {string} projectPath
 */
function configureJavaKotlin(projectConfig, projectPath) {
  const serverConfig = projectConfig.server;
  const generalConfig = projectConfig.general;
  const author = generalConfig.author;
  const backend = serverConfig.backend;
  const serverSrcMain = path.join(swConst.SERVER, swConst.SRC_MAIN);
  const serverSrcTest = path.join(swConst.SERVER, swConst.SRC_TEST);
  lightjs.info(`use backend '${backend}', create '${serverSrcMain}..' and '${serverSrcTest}..'`);

  const backendPath = path.join(backend, serverConfig.packagePath.replace(/\./g, '/'));
  const serverSrcMainEndpointPath = path.join(projectPath, serverSrcMain, backendPath);
  shjs.mkdir('-p', serverSrcMainEndpointPath);

  const serverSrcMainResources = path.join(projectPath, serverSrcMain, 'resources');
  const templatePath = 'src/template/server/backend';
  const backendExt = backend === swConst.KOTLIN ? 'kt' : backend;

  shjs.cp(path.join(templatePath, backend, `Application.${backendExt}`), serverSrcMainEndpointPath);
  shjs.cp(path.join(templatePath, backend, `CorsConfig.${backendExt}`), serverSrcMainEndpointPath);

  const webDir = path.join(serverSrcMainEndpointPath, 'web');
  shjs.mkdir('-p', webDir);
  shjs.cp(path.join(templatePath, backend, `AuthController.${backendExt}`), webDir);
  shjs.mkdir('-p', serverSrcMainResources);
  shjs.cp(path.join(templatePath, 'java-kotlin/*'), serverSrcMainResources);

  shjs.mkdir('-p', path.join(projectPath, serverSrcTest, backendPath));
  shjs.mkdir('-p', path.join(projectPath, serverSrcTest, 'resources'));

  lightjs.replacement(swConst.SW_PACKAGE, serverConfig.packagePath, [serverSrcMainEndpointPath, serverSrcMainResources], true, true, 'node_modules');

  const twoEol = `${os.EOL}${os.EOL}`;
  const indentSizeEndpoint = backend === swConst.KOTLIN ? 2 : 4;
  const indention = `${twoEol}[logback.xml]${os.EOL}indent_size = 4${twoEol}[*.${backendExt}]${os.EOL}indent_size = ${indentSizeEndpoint}`;
  const editorconfig = path.join(projectPath, '.editorconfig');
  lightjs.replacement('(trim_trailing_whitespace = true)', `$1${indention}`, [editorconfig]);

  if (author !== swConst.SW_AUTHOR) {
    lightjs.replacement(swConst.SW_AUTHOR, author, [serverSrcMainEndpointPath], true, true, 'node_modules');
  }

  const readmeMd = path.join(projectPath, swConst.SERVER, swConst.README_MD);
  shjs.cp(path.join(swConst.TEMPLATE_README, 'README.java-kotlin.md'), readmeMd);
  lightjs.replacement(swConst.SWAAPLATE, generalConfig.name, [readmeMd]);
}

/**
 * Configures the backend for php.
 *
 * @param {object} projectConfig
 * @param {string} projectPath
 */
function configurePhp(projectConfig, projectPath) {
  const projectName = projectConfig.general.name;
  lightjs.info(`-> update webpack config and api-backend`);

  const configServer = projectConfig.server;
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

exp.configureJavaKotlin = configureJavaKotlin;
exp.configurePhp = configurePhp;

module.exports = exp;
