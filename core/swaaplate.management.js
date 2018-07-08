'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const replace = require('replace');
const shjs = require('shelljs');

let management = {};

/**
 * Configures the management of the app.
 *
 * @param {object} swaaplateJsonData 
 */
function configureManagement(swaaplateJsonData, projectDir) {
  const serverConfig = swaaplateJsonData.serverConfig;
  if (serverConfig.management === 'maven') {
    lightjs.info(`use management 'maven', copy wrapper and pom-file for ${serverConfig.endpoint}`);
  } else if (serverConfig.management === 'gradle') {
    lightjs.info(`use management 'gradle', copy wrapper and build-file for ${serverConfig.endpoint}`);
  } else {
    lightjs.info('no management should be used, nothing special todo');
  }
}

management.configureManagement = configureManagement;

module.exports = management;
