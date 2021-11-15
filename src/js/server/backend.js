'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../root/const.js');
const swHelper = require('../root/helper.js');

let exp = {};
let projectConfig = {};
let projectPath = '';

/**
 * Configures the backend.
 *
 * @param {object} pConfig
 * @param {string} pPath
 */
function configure(pConfig, pPath) {
  projectConfig = pConfig;
  projectPath = pPath;

  lightjs.info('--> begin backend setup ...');

  if (!swHelper.isJs()) {
    shjs.mkdir(path.join(projectPath, swConst.CLIENT));
    shjs.mv(path.join(projectPath, `!(${swConst.CLIENT})`), path.join(projectPath, swConst.CLIENT));
    shjs.mv(path.join(projectPath, '.browserslistrc'), path.join(projectPath, swConst.CLIENT));
    shjs.mv(path.join(projectPath, '.eslintrc.json'), path.join(projectPath, swConst.CLIENT));
    shjs.mkdir(path.join(projectPath, swHelper.getBackendFolder()));

    if (swHelper.isJavaKotlin()) {
      configureJavaKotlin(projectConfig, projectPath);
    }
    if (swHelper.isPhp()) {
      configurePhp(projectConfig, projectPath);
    }
    updateReadmeFile();
  } else {
    lightjs.info('* backend js is used, no extra folders will be created');
  }
  lightjs.info('<-- end backend setup ...');
}

/**
 * Configures the backend for Java or Kotlin.
 *
 */
function configureJavaKotlin() {
  const serverConfig = projectConfig.server;
  const generalConfig = projectConfig.general;
  const backend = serverConfig.backend;
  const serverSrcMain = path.join(swConst.SERVER, swConst.SRC_MAIN);
  const serverSrcTest = path.join(swConst.SERVER, swConst.SRC_TEST);
  lightjs.info(`* configure backend '${backend}', create '${serverSrcMain}' and '${serverSrcTest}'`);

  const packagePath = serverConfig.javaKt.packagePath;
  const backendPath = path.join(backend, packagePath.replace(/\./g, '/'));
  const serverSrcMainJavaPath = path.join(projectPath, serverSrcMain, backendPath);
  shjs.mkdir('-p', serverSrcMainJavaPath);

  const serverSrcMainResourcesPath = path.join(projectPath, serverSrcMain, 'resources');
  const templatePath = 'src/template/server/backend';

  shjs.cp(path.join(templatePath, backend, `Application.${backend}`), serverSrcMainJavaPath);

  const webPath = path.join(serverSrcMainJavaPath, 'web');
  shjs.mkdir('-p', webPath);
  shjs.cp(path.join(templatePath, backend, `AuthController.${backend}`), webPath);
  shjs.mkdir('-p', serverSrcMainResourcesPath);
  shjs.cp(path.join(templatePath, 'java-kt/*'), serverSrcMainResourcesPath);

  shjs.mkdir('-p', path.join(projectPath, serverSrcTest, backendPath));
  shjs.mkdir('-p', path.join(projectPath, serverSrcTest, 'resources'));

  lightjs.replacement('{{PROJECT.AUTHOR}}', generalConfig.author, [path.join(serverSrcMainJavaPath, `Application.${backend}`)]);
  lightjs.replacement('{{PROJECT.AUTHOR}}', generalConfig.author, [path.join(webPath, `AuthController.${backend}`)]);
  lightjs.replacement('{{PROJECT.PACKAGEPATH}}', packagePath, [path.join(serverSrcMainJavaPath, `Application.${backend}`)]);
  lightjs.replacement('{{PROJECT.PACKAGEPATH}}', packagePath, [path.join(webPath, `AuthController.${backend}`)]);
  lightjs.replacement('{{PROJECT.PACKAGEPATH}}', packagePath, [path.join(serverSrcMainResourcesPath, 'logback-spring.xml')]);
}

/**
 * Configures the backend for php.
 *
 */
function configurePhp() {
  const serverConfig = projectConfig.server;
  const serverDir = swHelper.getBackendFolder();
  lightjs.info(`* configure backend 'php', create 'webpack config' and '${serverDir}' as server folder`);

  const srcPath = path.join(projectPath, serverDir);
  shjs.mkdir('-p', srcPath);
  const phpTemplatePath = 'src/template/server/backend/php';
  const generalConfig = projectConfig.general;

  shjs.cp('-r', path.join(phpTemplatePath, swConst.CONFIG), srcPath);
  shjs.cp('-r', path.join(phpTemplatePath, 'service'), srcPath);

  shjs.cp(path.join(srcPath, swConst.CONFIG, 'config.default.php'), path.join(srcPath, swConst.CONFIG, 'config.dev.php'));
  shjs.cp(path.join(srcPath, swConst.CONFIG, 'config.default.php'), path.join(srcPath, swConst.CONFIG, 'config.prod.php'));
  if (generalConfig.useSecurity) {
    shjs.cp(path.join(phpTemplatePath, swConst.AUTH_SERVICE_PHP), path.join(srcPath, 'service'));

    const authServicePath = path.join(srcPath, 'service', swConst.AUTH_SERVICE_PHP);
    lightjs.replacement('{{PROJECT.NAME}}', generalConfig.name, [authServicePath]);
  }
  if (serverConfig.php.modRewritePhpExtension) {
    shjs.cp(path.join(phpTemplatePath, '.htaccess'), srcPath);
  }

  const configMode = generalConfig.useMock ? `if (process.env.NODE_ENV !== 'mock') {` + os.EOL + '  ' : '';
  const webpackConfigFile = path.join(projectPath, swConst.CLIENT, swConst.WEBPACK_CONFIG_JS);
  shjs.cp(path.join(phpTemplatePath, swConst.WEBPACK_CONFIG_JS), webpackConfigFile);
  lightjs.replacement('{{PROJECT.INDENTATION}}', generalConfig.useMock ? '  ' : '', [webpackConfigFile]);
  lightjs.replacement('{{PROJECT.CONFIGMODE}}', configMode, [webpackConfigFile]);
  lightjs.replacement('{{PROJECT.SERVERDIR}}', serverDir, [webpackConfigFile]);
  lightjs.replacement('{{PROJECT.CONFIGMODEEND}}', generalConfig.useMock ? os.EOL + '}' : '', [webpackConfigFile]);
}

/**
 * Updates the readme file for the server.
 *
 */
function updateReadmeFile() {
  const readmeMd = path.join(projectPath, swHelper.getBackendFolder(), swConst.README_MD);
  lightjs.info(`* update '${readmeMd}'`);

  shjs.cp(path.join('src/template/server/readme', `README.${swHelper.isPhp() ? 'php' : 'java-kotlin'}.md`), readmeMd);

  lightjs.replacement('{{PROJECT.NAME}}', projectConfig.general.name, [readmeMd]);
  lightjs.replacement('{{PROJECT.TITLE}}', projectConfig.general.title, [readmeMd]);
  lightjs.replacement('{{PROJECT.SERVERDIR}}', swHelper.getBackendFolder(), [readmeMd]);
}

exp.configure = configure;

module.exports = exp;
