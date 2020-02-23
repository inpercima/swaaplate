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
    if (management === swConst.MAVEN) {
      lightjs.info(`-> use management '${swConst.MAVEN}', copy wrapper and pom-file for ${backend}`);

      shjs.cp('-r', path.join(managementPath, swConst.DOT_MVN), serverPath);
    } else if (serverConfig.management === swConst.GRADLE) {
      lightjs.info(`-> use management '${swConst.GRADLE}', copy wrapper and build-file for ${backend}`);

      shjs.cp(path.join(managementPath, swConst.DOT_GRADLE), serverPath);
    } else {
      lightjs.info('-> no management should be used');
    }
    if (management === swConst.MAVEN || management === swConst.GRADLE) {
      const dismatch = backend === swConst.JAVA ? swConst.KOTLIN : swConst.JAVA;
      const pomXml = path.join(serverPath, swConst.POM_XML);
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
