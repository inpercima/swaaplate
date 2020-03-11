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

exp.configure = configure;
exp.getBackendFolder = getBackendFolder;
exp.isJs = isJs;
exp.isJava = isJava;
exp.isJavaKotlin = isJavaKotlin;
exp.isPhp = isPhp;

module.exports = exp;
