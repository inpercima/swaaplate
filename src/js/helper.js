'use strict';

/* requirements */
const swConst = require('./const.js');

/**
 * Determines the backend folder.
 *
 */
function getBackendFolder() {
  const serverConfig = exp.config.server;
  const serverAsApi = serverConfig.backend === swConst.PHP && serverConfig.serverAsApi;
  return serverConfig.backend === swConst.JS ? '' : (serverAsApi ? swConst.API : swConst.SERVER);
}

/**
 * Determines the client folder.
 *
 */
function getClientFolder() {
  return exp.config.server.backend === swConst.JS ? '' : swConst.CLIENT;
}

let exp = {};
exp.config = {};
exp.getBackendFolder = getBackendFolder;
exp.getClientFolder = getClientFolder;

module.exports = exp;

