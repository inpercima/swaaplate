'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../root/const.js');
const swHelper = require('../root/helper.js');
const swVersion = require('../root/version');

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

  lightjs.info('--> begin management setup ...');

  const serverConfig = projectConfig.server;
  if (swHelper.isJavaKotlin()) {
    const serverPath = path.join(projectPath, swConst.SERVER);
    const management = serverConfig.management;
    const managementPath = path.join('src/template/server/management', management);

    shjs.mkdir('-p', serverPath);

    const backend = serverConfig.backend;
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
    } else {
      lightjs.info('* a management unlike maven or gradle is used, nothing todo by swaaplate');
    }
  } else {
    lightjs.info('* a backend unlike java or kotlin is used, no management is used');
  }

  lightjs.info('<-- end management setup ...');
}

/**
 * Replaces placeholder in pom.xml.
 *
 * @param {string} pomXml
 */
function replaceInPomFile(pomXml) {
  const generalConfig = projectConfig.general;
  lightjs.replacement('{{PROJECT.DESCRIPTION}}', generalConfig.description, [pomXml]);
  lightjs.replacement('{{PROJECT.DIST}}', projectConfig.client.buildDir, [pomXml]);
  lightjs.replacement('{{PROJECT.GROUPID}}', projectConfig.server.packagePath, [pomXml]);
  lightjs.replacement('{{PROJECT.MAVENJARPLUGINVERSION}}', swVersion.MAVEN_JAR_PLUGIN, [pomXml]);
  lightjs.replacement('{{PROJECT.NAME}}', generalConfig.name, [pomXml]);
  lightjs.replacement('{{PROJECT.SPRINGBOOTVERSION}}', swVersion.SPRING_BOOT, [pomXml]);
  lightjs.replacement('{{PROJECT.TITLE}}', generalConfig.title, [pomXml]);
}

exp.configure = configure;

module.exports = exp;
