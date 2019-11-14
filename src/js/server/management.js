'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../const.js');

let management = {};

/**
 * Configures the management of the app.
 *
 * @param {object} config
 * @param {string} projectPath
 */
function configure(config, projectPath) {
  const serverConfig = config.server;
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
      replaceInPomFile(config, pomXml);
    }
  } else {
    lightjs.info('-> an backend unlike java or kotlin is used, no management is needed');
  }
}

/**
 * Configures the management of the app.
 *
 * @param {object} config
 * @param {string} pomXml
 */
function replaceInPomFile(config, pomXml) {
  const packageJsonConfig = config.packageJson;
  lightjs.replacement(swConst.SW_PACKAGE, config.server.packagePath, [pomXml]);
  lightjs.replacement(swConst.SWAAPLATE, packageJsonConfig.name, [pomXml]);
  lightjs.replacement(swConst.DIST, config.general.buildWebDir, [pomXml]);

  lightjs.replacement(swConst.SW_DESCRIPTION, packageJsonConfig.description, [pomXml]);
}

management.configure = configure;

module.exports = management;
