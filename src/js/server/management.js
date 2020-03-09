'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../const.js');

let exp = {};
let projectConfig = {};
let projectPath = '';

/**
 * Configures the management of the app.
 *
 * @param {object} pConfig
 * @param {string} pPath
 */
function configure(pConfig, pPath) {
  projectConfig = pConfig;
  projectPath = pPath;

  const serverConfig = projectConfig.server;
  const backend = serverConfig.backend;

  if (backend === swConst.JAVA || backend === swConst.KOTLIN) {
    const serverPath = path.join(projectPath, swConst.SERVER);
    const management = serverConfig.management;
    const managementPath = path.join('src/template/server/management', management);

    shjs.mkdir('-p', serverPath);

    shjs.cp('-r', path.join(managementPath, '*'), serverPath);
    if (management === swConst.MAVEN || management === 'gradle') {
      lightjs.info(`* use management '${management}', copy wrapper and pom-file for ${backend}`);

      if (management === swConst.MAVEN) {
        shjs.cp('-r', path.join(managementPath, '.mvn'), serverPath);
      } else {
        shjs.cp('-r', path.join(managementPath, '.gradle'), serverPath);
      }
      const dismatch = swHelper.isJava() ? swConst.KOTLIN : swConst.JAVA;
      const pomXml = path.join(serverPath, 'pom.xml');
      shjs.mv(path.join(serverPath, `pom.${backend}.xml`), pomXml);
      shjs.rm(path.join(serverPath, `pom.${dismatch}.xml`));
      replaceInPomFile(pomXml);
    }
  } else {
    lightjs.info('-> an backend unlike java or kotlin is used, no management should be used');
  }
}

/**
 * Configure the management of the app.
 *
 * @param {string} pomXml
 */
function replaceInPomFile(pomXml) {
  const generalConfig = projectConfig.general;
  lightjs.replacement(swConst.SW_PACKAGE, projectConfig.server.packagePath, [pomXml]);
  lightjs.replacement(swConst.SWAAPLATE, generalConfig.name, [pomXml]);
  lightjs.replacement(swConst.DIST, projectConfig.client.buildDir, [pomXml]);

  lightjs.replacement(swConst.SW_DESCRIPTION, generalConfig.description, [pomXml]);
}

exp.configure = configure;

module.exports = exp;
