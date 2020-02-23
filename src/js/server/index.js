'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const shjs = require('shelljs');

const swServerBackend = require('./backend.js');
const swConst = require('../const.js');

let exp = {};
let projectConfig = {};
let projectPath = '';

/**
 * Configure the backend.
 *
 * @param {object} pConfig
 * @param {string} pPath
 */
function configure(pConfig, pPath) {
  projectConfig = pConfig;
  projectPath = pPath;

  lightjs.info('check used backend ...');

  const serverConfig = projectConfig.server;
  if (serverConfig.backend !== swConst.JS) {
    lightjs.info('... not js is used, create folder for client and server and move files');
    shjs.mkdir(path.join(projectPath, swConst.CLIENT));
    shjs.mv(path.join(projectPath, `!(${swConst.CLIENT})`), path.join(projectPath, swConst.CLIENT));
    shjs.mkdir(path.join(projectPath, getBackendFolder()));
  } else {
    lightjs.info('... js is used, no folder will be created');
  }

  lightjs.info(`prepare data for backend '${serverConfig.backend}'`);

  // java or kotlin
  if (serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN) {
    swServerBackend.configureJavaKotlin(projectConfig, projectPath);
  }
  // php
  if (serverConfig.backend === swConst.PHP) {
    swServerBackend.configurePhp(projectConfig, projectPath);
  }
  // js
  if (serverConfig.backend === swConst.JS) {
    lightjs.info(`use backend 'js', nothing special todo`);
  }
}

/**
 * Determine the backend folder.
 *
 */
function getBackendFolder() {
  const serverConfig = projectConfig.server;
  const serverAsApi = serverConfig.backend === swConst.PHP && serverConfig.serverAsApi;
  return serverConfig.backend === swConst.JS ? '' : (serverAsApi ? swConst.API : swConst.SERVER);
}

/**
 * Update readme file.
 *
 */
function updateReadmeFile() {
  const serverConfig = projectConfig.server;
  const serverOrApi = serverConfig.serverAsApi && serverConfig.backend === swConst.PHP ? swConst.API : swConst.SERVER;
  const readmeMd = path.join(projectPath, serverOrApi, swConst.README_MD);
  lightjs.info(`update '${readmeMd}'`);

  const projectName = projectConfig.general.name;
  lightjs.replacement('{{PROJECT.NAME}}', projectName, [readmeMd]);
}

exp.configure = configure;
exp.updateReadmeFile = updateReadmeFile;

module.exports = exp;
