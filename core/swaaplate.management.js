'use strict';

/* requirements */
const lightjs = require('light-js');
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
  const management = serverConfig.management;
  const endpoint = serverConfig.endpoint;

  if (endpoint === 'java' || endpoint === 'kotlin') {
    if (management === 'maven') {
      lightjs.info(`use management 'maven', copy wrapper and pom-file for ${endpoint}`);

      shjs.cp('-r', `management/${management}/*`, projectDir);
      shjs.cp('-r', `management/${management}/.mvn`, projectDir);

      const dismatch = endpoint === 'java' ? 'kotlin' : 'java';
      const pomXml = path.join(projectDir, 'pom.xml');
      shjs.mv(path.join(projectDir, `pom.${endpoint}.xml`), pomXml);
      shjs.rm(path.join(projectDir, `pom.${dismatch}.xml`));

      replaceInPomFile(swaaplateJsonData, pomXml);
    } else if (serverConfig.management === 'gradle') {
      lightjs.info(`use management 'gradle', copy wrapper and build-file for ${endpoint}`);
      // TODO comming soon
    } else {
      lightjs.info('no management should be used');
    }
  } else {
    lightjs.info('an endpoint unlike java or kotlin is used, no management is needed');
  }
}

function replaceInPomFile(swaaplateJsonData, pomXml) {
  const buildWebDir = swaaplateJsonData.generalConfig.buildDir;
  const distDir = 'dist';
  if (buildWebDir !== distDir) {
    replace({ regex: distDir, replacement: buildWebDir, paths: [pomXml], silent: true });
  }
  replace({ regex: 'net.inpercima.swaaplate', replacement: swaaplateJsonData.serverConfig.packagePath, paths: [pomXml], silent: true });
  replace({ regex: 'swaaplate', replacement: swaaplateJsonData.packageJsonConfig.name, paths: [pomXml], silent: true });

  const description = '\\[s\\]imple \\[w\\]eb \\[a\\]pp \\[a\\]ngular tem\\[plate\\]. A very simple own template for webapps.';
  const newDescription = swaaplateJsonData.packageJsonConfig.description;
  replace({ regex: `${description}`, replacement: newDescription, paths: [pomXml], silent: true });
}

management.configureManagement = configureManagement;

module.exports = management;
