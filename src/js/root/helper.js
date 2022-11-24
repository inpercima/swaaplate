'use strict';

/* requirements */
const swProjectConst = require('./project.const');

let exp = {};
let projectConfig = {};

/**
 * Configures the helper.
 *
 * @param {object} pConfig
 */
function configure(pConfig) {
  projectConfig = pConfig;
}

/**
 * Determines the backend folder.
 *
 */
function getBackendFolder() {
  return isPhp() && projectConfig.backend.php.runAsApi ? swProjectConst.API : swProjectConst.SERVER;
}

/**
 * Checks for js.
 *
 */
function isJs() {
  return projectConfig.backend.language === swProjectConst.JS;
}

/**
 * Checks for java.
 *
 */
function isJava() {
  return projectConfig.backend.language === swProjectConst.JAVA;
}

/**
 * Checks for mock.
 *
 */
function isMock() {
  return projectConfig.general.useMock;
}

/**
 * Checks for php.
 *
 */
function isPhp() {
  return projectConfig.backend.language === swProjectConst.PHP;
}

/**
 * Checks for java or kotlin.
 *
 */
function isJavaKotlin() {
  const language = projectConfig.backend.language;
  return language === swProjectConst.JAVA || language === swProjectConst.KOTLIN;
}

/**
 * Checks if routing is enabeld.
 */
function isRouting() {
  const modulesConfig = projectConfig.frontend.modules;
  return modulesConfig.enabled && modulesConfig.routing;
}

/**
 * Checks the manager to yarn.
 *
 */
function isYarn() {
  return projectConfig.frontend.useYarn;
}

/**
 * Checks and return yarn or npm.
 *
 */
function yarnOrNpm() {
  return isYarn() ? swProjectConst.YARN : swProjectConst.NPM;
}

/**
 * Returns the command with yarn or npm.
 *
 * @param {string} command
 */
function yarnNpmCommand(command) {
  return yarnOrNpm() + (!isYarn() ? ' ' + command : '');
}

exp.configure = configure;
exp.getBackendFolder = getBackendFolder;
exp.isJs = isJs;
exp.isJava = isJava;
exp.isMock = isMock;
exp.isJavaKotlin = isJavaKotlin;
exp.isPhp = isPhp;
exp.isRouting = isRouting;
exp.isYarn = isYarn;
exp.yarnOrNpm = yarnOrNpm;
exp.yarnNpmCommand = yarnNpmCommand;

module.exports = exp;
