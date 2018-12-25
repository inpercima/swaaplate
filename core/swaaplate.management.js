'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const shjs = require('shelljs');

let management = {};

/**
 * Configures the management of the app.
 *
 * @param {object} swaaplateJsonData
 */
function configureManagement(swaaplateJsonData, serverDir) {
  const serverConfig = swaaplateJsonData.serverConfig;
  const management = serverConfig.management;
  const endpoint = serverConfig.endpoint;

  if (endpoint === 'java' || endpoint === 'kotlin') {
    if (management === 'maven') {
      lightjs.info(`-> use management 'maven', copy wrapper and pom-file for ${endpoint}`);

      shjs.cp('-r', `management/${management}/*`, serverDir);
      shjs.cp('-r', `management/${management}/.mvn`, serverDir);

      const dismatch = endpoint === 'java' ? 'kotlin' : 'java';
      const pomXml = path.join(serverDir, 'pom.xml');
      shjs.mv(path.join(serverDir, `pom.${endpoint}.xml`), pomXml);
      shjs.rm(path.join(serverDir, `pom.${dismatch}.xml`));

      replaceInPomFile(swaaplateJsonData, pomXml);
    } else if (serverConfig.management === 'gradle') {
      lightjs.info(`-> use management 'gradle', copy wrapper and build-file for ${endpoint}`);
      // TODO comming soon
    } else {
      lightjs.info('-> no management should be used');
    }
  } else {
    lightjs.info('-> an endpoint unlike java or kotlin is used, no management is needed');
  }
}

function replaceInPomFile(swaaplateJsonData, pomXml) {
  lightjs.replacement('net.inpercima.swaaplate', swaaplateJsonData.serverConfig.packagePath, [pomXml]);
  lightjs.replacement('swaaplate', swaaplateJsonData.packageJsonConfig.name, [pomXml]);

  const description = '\\[s\\]imple \\[w\\]eb \\[a\\]pp \\[a\\]ngular tem\\[plate\\]. A very simple own template for webapps.';
  const newDescription = swaaplateJsonData.packageJsonConfig.description;
  lightjs.replacement(`${description}`, newDescription, [pomXml]);
}

management.configureManagement = configureManagement;

module.exports = management;
