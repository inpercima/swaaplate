'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../const.js');
const swHelper = require('../helper.js');

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
  const backend = serverConfig.backend;
  const serverSrcMain = path.join(swConst.SERVER, swConst.SRC_MAIN);
  const serverSrcTest = path.join(swConst.SERVER, swConst.SRC_TEST);
  lightjs.info(`* configure backend '${backend}', create '${serverSrcMain}' and '${serverSrcTest}'`);

  const backendPath = path.join(backend, serverConfig.packagePath.replace(/\./g, '/'));
  const serverSrcMainJavaPath = path.join(projectPath, serverSrcMain, backendPath);
  shjs.mkdir('-p', serverSrcMainJavaPath);

  const serverSrcMainResourcesPath = path.join(projectPath, serverSrcMain, 'resources');
  const templatePath = 'src/template/server/backend';

  shjs.cp(path.join(templatePath, backend, `Application.${backend}`), serverSrcMainJavaPath);

  const webPath = path.join(serverSrcMainJavaPath, 'web');
  shjs.mkdir('-p', webPath);
  shjs.cp(path.join(templatePath, backend, `AuthController.${backend}`), webPath);
  shjs.mkdir('-p', serverSrcMainResourcesPath);
  shjs.cp(path.join(templatePath, 'java-kotlin/*'), serverSrcMainResourcesPath);

  shjs.mkdir('-p', path.join(projectPath, serverSrcTest, backendPath));
  shjs.mkdir('-p', path.join(projectPath, serverSrcTest, 'resources'));

  const twoEol = os.EOL + os.EOL;
  const indentSize = backend === swConst.KOTLIN ? 2 : 4;
  const indention = `${twoEol}[logback.xml]${os.EOL}indent_size = 4${twoEol}[*.${backend}]${os.EOL}indent_size = ${indentSize}`;
  const editorconfig = path.join(projectPath, swConst.DOT_EDITORCONFIG);
  lightjs.replacement('(trim_trailing_whitespace = true)', `$1${indention}`, [editorconfig]);


  lightjs.replacement('{{PROJECT.AUTHOR}}', generalConfig.author, [path.join(serverSrcMainJavaPath, `Application.${backend}`)]);
  lightjs.replacement('{{PROJECT.AUTHOR}}', generalConfig.author, [path.join(webPath, `AuthController.${backend}`)]);
  lightjs.replacement('{{PROJECT.PACKAGEPATH}}', serverConfig.packagePath, [path.join(serverSrcMainJavaPath, `Application.${backend}`)]);
  lightjs.replacement('{{PROJECT.PACKAGEPATH}}', serverConfig.packagePath, [path.join(webPath, `AuthController.${backend}`)]);
  lightjs.replacement('{{PROJECT.PACKAGEPATH}}', serverConfig.packagePath, [path.join(serverSrcMainResourcesPath, 'logback.xml')]);
}

/**
 * Configures the backend for php.
 *
 * @param {object} projectConfig
 * @param {string} projectPath
 */
function configurePhp(projectConfig, projectPath) {
  const serverConfig = projectConfig.server;
  lightjs.info(`* configure backend 'php', create 'webpack config' and '${swHelper.getBackendFolder()}' as server folder`);

  const srcMainPath = path.join(projectPath, serverDir, swConst.SRC_MAIN);
  shjs.mkdir('-p', srcMainPath);
  const phpTemplatePath = 'src/template/server/backend/php';
  shjs.cp(path.join(phpTemplatePath, 'auth.php'), srcMainPath);
  shjs.cp(path.join(phpTemplatePath, swConst.AUTH_SERVICE_PHP), srcMainPath);
  if (serverConfig.htaccess) {
    shjs.cp(path.join(phpTemplatePath, '.htaccess'), srcMainPath);
  }

  const webpackConfigFile = path.join(projectPath, swConst.CLIENT, swConst.WEBPACK_CONFIG_JS);
  shjs.cp(path.join(phpTemplatePath, swConst.WEBPACK_CONFIG_JS), webpackConfigFile);
  lightjs.replacement('{{PROJECT.SERVERDIR}}', serverDir, [webpackConfigFile]);

  const authServicePath = path.join(projectPath, serverDir, swConst.SRC_MAIN, swConst.AUTH_SERVICE_PHP);
  lightjs.replacement('{{PROJECT.NAME}}', projectConfig.general.name, [authServicePath]);
}

exp.configureJavaKotlin = configureJavaKotlin;
exp.configurePhp = configurePhp;

module.exports = exp;
