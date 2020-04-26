'use strict';

/* requirements */
const swConst = require('./const');

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
  const serverConfig = projectConfig.server;
  const serverAsApi = isPhp() && serverConfig.serverAsApi;
  return serverAsApi ? 'api' : swConst.SERVER;
}

/**
 * Checks for js.
 *
 */
function isJs() {
  return projectConfig.server.backend === swConst.JS;
}

/**
 * Checks for java.
 *
 */
function isJava() {
  return projectConfig.server.backend === swConst.JAVA;
}


/**
 * Checks for php.
 *
 */
function isPhp() {
  return projectConfig.server.backend === swConst.PHP;
}

/**
 * Checks for java or kotlin.
 *
 */
function isJavaKotlin() {
  const serverConfig = projectConfig.server;
  return serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN;
}

/**
 * Checks the manager to yarn.
 *
 */
function useYarn() {
  return projectConfig.client.useYarn;
}

/**
 * Checks and return yarn or npm.
 *
 */
function yarnOrNpm() {
  return useYarn() ? swConst.YARN : swConst.NPM;
}

/**
 * Returns the command with yarn or npm.
 *
 * @param {string} command
 */
function yarnNpmCommand(command) {
  return yarnOrNpm() + (!useYarn() ? ' ' + command : '');
}

exp.configure = configure;
exp.getBackendFolder = getBackendFolder;
exp.isJs = isJs;
exp.isJava = isJava;
exp.isJavaKotlin = isJavaKotlin;
exp.isPhp = isPhp;
exp.useYarn = useYarn;
exp.yarnOrNpm = yarnOrNpm;
exp.yarnNpmCommand = yarnNpmCommand;

module.exports = exp;
