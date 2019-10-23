'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');
const swConst = require('../../const.js');

let backendJavaKotlin = {};

/**
 * Configures the backend for Java or Kotlin.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function configure(config, projectPath) {
  const serverConfig = config.server;
  const author = config.packageJson.author;
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

  lightjs.replacement(swConst.SW_PACKAGE, serverConfig.packagePath, [serverSrcMainEndpointPath, serverSrcMainResources], true, true);

  const twoEol = `${os.EOL}${os.EOL}`;
  const indentSizeEndpoint = backend === swConst.KOTLIN ? 2 : 4;
  const indention = `${twoEol}[logback.xml]${os.EOL}indent_size = 4${twoEol}[*.${backendExt}]${os.EOL}indent_size = ${indentSizeEndpoint}`;
  const editorconfig = path.join(projectPath, '.editorconfig');
  lightjs.replacement(swConst.WHITESPACES, `$1${indention}`, [editorconfig]);

  if (author !== swConst.SW_AUTHOR) {
    lightjs.replacement(swConst.SW_AUTHOR, author, [serverSrcMainEndpointPath], true, true);
  }

  const readmeMd = path.join(projectPath, swConst.SERVER, swConst.README_MD);
  shjs.cp(path.join(swConst.TEMPLATE_README, 'README.java-kotlin.md'), readmeMd);
  lightjs.replacement(swConst.SWAAPLATE, config.packageJson.name, [readmeMd]);
}

backendJavaKotlin.configure = configure;

module.exports = backendJavaKotlin;
