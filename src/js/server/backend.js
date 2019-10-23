'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const shjs = require('shelljs');

const swConst = require('../const.js');
const swBackendJavaKotlin = require('./backend/javakotlin.js');
const swBackendPhp = require('./backend/php.js');

let backend = {};

/**
 * Configures the backend of the app.
 *
 * @param {object} config
 * @param {object} projectPath
 */
function configure(config, projectPath) {
  let clientPath = '';
  const serverConfig = config.server;
  lightjs.info(`prepare data for backend '${serverConfig.backend}'`);

  // java, kotlin and php
  if (serverConfig.backend !== swConst.JS) {
    clientPath = swConst.CLIENT;
    shjs.mkdir('-p', path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, 'e2e'), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, 'mock'), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, 'src'), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, swConst.ANGULAR_JSON), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, 'browserslist'), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, 'karma.conf.js'), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, swConst.PACKAGE_JSON), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, 'tsconfig.app.json'), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, 'tsconfig.json'), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, 'tsconfig.spec.json'), path.join(projectPath, clientPath));
    shjs.mv(path.join(projectPath, swConst.TSLINT_JSON), path.join(projectPath, clientPath));
  }
  // java or kotlin
  if (serverConfig.backend === swConst.JAVA || serverConfig.backend === swConst.KOTLIN) {
    swBackendJavaKotlin.configure(config, projectPath);
  }
  // php
  if (serverConfig.backend === swConst.PHP) {
    swBackendPhp.configure(config, projectPath);
  }
  // js
  if (serverConfig.backend === swConst.JS) {
    lightjs.info(`use backend 'js', nothing special todo`);
  }
}

/**
 * Updates the server readme file.
 *
 * @param {object} config
 * @param {object} projectPath
 */
function updateReadmeFile(config, projectPath) {
  const readmeMd = path.join(projectPath, swConst.SERVER, swConst.README_MD);
  lightjs.info(`update '${readmeMd}'`);

  const packageJsonConfig = config.packageJson;
  const projectName = packageJsonConfig.name;
  lightjs.replacement('{{PROJECT.NAME}}', projectName, [readmeMd]);
}

backend.configure = configure;
backend.updateReadmeFile = updateReadmeFile;

module.exports = backend;
