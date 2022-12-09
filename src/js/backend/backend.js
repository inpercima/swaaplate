'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

const swProjectConst = require('../root/project.const.js');
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

  if (!swHelper.isNone()) {
    shjs.mkdir(path.join(projectPath, swProjectConst.FRONTEND));
    shjs.mv(path.join(projectPath, `!(${swProjectConst.FRONTEND})`), path.join(projectPath, swProjectConst.FRONTEND));
    shjs.mv(path.join(projectPath, '.eslintrc.json'), path.join(projectPath, swProjectConst.FRONTEND));

    if (swHelper.isJavaKotlin() || swHelper.isPhp()) {
      shjs.mkdir(path.join(projectPath, swHelper.getBackendFolder()));
    }

    if (swHelper.isJavaKotlin()) {
      configureJavaKotlin();
    }
    if (swHelper.isPhp()) {
      configurePhp();
    }
    if (swHelper.isNestJs()) {
      configureNestjs();
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
  const backendConfig = projectConfig.backend;
  const generalConfig = projectConfig.general;
  const language = backendConfig.language;
  const srcMain = path.join(swProjectConst.BACKEND, swProjectConst.SRC_MAIN);
  const srcTest = path.join(swProjectConst.BACKEND, swProjectConst.SRC_TEST);
  lightjs.info(`* configure backend '${language}', create '${srcMain}' and '${srcTest}'`);

  const packagePath = backendConfig.javaKt.packagePath;
  const backendPath = path.join(language, packagePath.replace(/\./g, '/'));
  const srcMainJavaPath = path.join(projectPath, srcMain, backendPath);
  shjs.mkdir('-p', srcMainJavaPath);

  const srcMainResourcesPath = path.join(projectPath, srcMain, 'resources');
  const templatePath = 'src/template/backend/language';

  shjs.cp(path.join(templatePath, language, `Application.${language}`), srcMainJavaPath);

  const webPath = path.join(srcMainJavaPath, 'web');
  shjs.mkdir('-p', webPath);
  shjs.cp(path.join(templatePath, language, `AuthController.${language}`), webPath);
  shjs.mkdir('-p', srcMainResourcesPath);
  shjs.cp(path.join(templatePath, 'java-kt/*'), srcMainResourcesPath);

  shjs.mkdir('-p', path.join(projectPath, srcTest, backendPath));
  shjs.mkdir('-p', path.join(projectPath, srcTest, 'resources'));

  lightjs.replacement('{{PROJECT.AUTHOR}}', generalConfig.author, [path.join(srcMainJavaPath, `Application.${language}`)]);
  lightjs.replacement('{{PROJECT.AUTHOR}}', generalConfig.author, [path.join(webPath, `AuthController.${language}`)]);
  lightjs.replacement('{{PROJECT.PACKAGEPATH}}', packagePath, [path.join(srcMainJavaPath, `Application.${language}`)]);
  lightjs.replacement('{{PROJECT.PACKAGEPATH}}', packagePath, [path.join(webPath, `AuthController.${language}`)]);
  lightjs.replacement('{{PROJECT.PACKAGEPATH}}', packagePath, [path.join(srcMainResourcesPath, 'logback-spring.xml')]);
}

/**
 * Configures the backend for php.
 *
 */
function configurePhp() {
  const backendConfig = projectConfig.backend;
  const backendFolder = swHelper.getBackendFolder();
  lightjs.info(`* configure backend 'php' and create '${backendFolder}' as backend folder`);

  const srcPath = path.join(projectPath, backendFolder);
  shjs.mkdir('-p', srcPath);
  const phpTemplatePath = 'src/template/backend/language/php';
  const generalConfig = projectConfig.general;

  shjs.cp('-r', path.join(phpTemplatePath, swProjectConst.CONFIG), srcPath);
  shjs.cp('-r', path.join(phpTemplatePath, 'service'), srcPath);

  shjs.cp(path.join(srcPath, swProjectConst.CONFIG, 'config.default.php'), path.join(srcPath, swProjectConst.CONFIG, 'config.dev.php'));
  shjs.cp(path.join(srcPath, swProjectConst.CONFIG, 'config.default.php'), path.join(srcPath, swProjectConst.CONFIG, 'config.prod.php'));
  if (generalConfig.useSecurity) {
    shjs.cp(path.join(phpTemplatePath, swProjectConst.AUTH_SERVICE_PHP), path.join(srcPath, 'service'));

    const authServicePath = path.join(srcPath, 'service', swProjectConst.AUTH_SERVICE_PHP);
    lightjs.replacement('{{PROJECT.NAME}}', generalConfig.name, [authServicePath]);
  }
  if (backendConfig.php.modRewritePhpExtension) {
    shjs.cp(path.join(phpTemplatePath, '.htaccess'), srcPath);
  }
}

/**
 * Configures the backend for nestjs.
 *
 */
function configureNestjs() {
  lightjs.info(`* configure backend 'nestjs'`);
  
  const pwd = shjs.pwd();
  const projectName = projectConfig.general.name;
  if (shjs.which('nest')) {
    shjs.cd(projectPath);
    lightjs.info(`run 'nest new ${projectName} --strict --skip-git --package-manager ${swHelper.yarnOrNpm()}'`);
    shjs.exec(`nest new ${projectName} --strict --skip-git --package-manager ${swHelper.yarnOrNpm()}`);
    
    // rename folder named as project to backend
    shjs.mv(projectName, swProjectConst.BACKEND);
  } else {
    lightjs.error(`sorry, this script requires 'nest'`);
    shjs.exit(1);
  }
  shjs.cd(pwd);
}

/**
 * Updates the readme file for the backend.
 *
 */
function updateReadmeFile() {
  const readmeMd = path.join(projectPath, swHelper.getBackendFolder(), swProjectConst.README_MD);
  lightjs.info(`* update '${readmeMd}'`);

  const readmSuffix = swHelper.isJavaKotlin() ? 'java-kotlin' : swHelper.isNestJs() ? 'nestjs' : 'php';
  shjs.cp(path.join('src/template/backend/readme', `README.${readmSuffix}.md`), readmeMd);

  lightjs.replacement('{{PROJECT.NAME}}', projectConfig.general.name, [readmeMd]);
  lightjs.replacement('{{PROJECT.TITLE}}', projectConfig.general.title, [readmeMd]);
  lightjs.replacement('{{PROJECT.BACKENDFOLDER}}', swHelper.getBackendFolder(), [readmeMd]);
  lightjs.replacement('{{PROJECT.USAGEYN}}', swHelper.yarnNpmCommand('run'), [readmeMd]);
}

exp.configure = configure;

module.exports = exp;
