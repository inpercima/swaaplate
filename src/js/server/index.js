'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const shjs = require('shelljs');

const swBackend = require('./backend.js');
const swConst = require('../const.js');
const swHelper = require('../helper.js');

let exp = {};
let projectConfig = {};
let projectPath = '';

/**
 * Configures the backend.
 *
 * @param {object} pConfig
 * @param {string} pPath
 */
function configure(pConfig, pPath) {
  projectConfig = pConfig;
  projectPath = pPath;

  lightjs.info('--> begin backend setup ...');

  if (!swHelper.isJs()) {
    shjs.mkdir(path.join(projectPath, swConst.CLIENT));
    shjs.mv(path.join(projectPath, `!(${swConst.CLIENT})`), path.join(projectPath, swConst.CLIENT));
    shjs.mkdir(path.join(projectPath, swHelper.getBackendFolder()));

    if (swHelper.isJavaKotlin()) {
      swBackend.configureJavaKotlin(projectConfig, projectPath);
    }
    if (swHelper.isPhp()) {
      swBackend.configurePhp(projectConfig, projectPath);
    }
    updateReadmeFile();
  } else {
    lightjs.info('* backend js is used, no extra folders will be created');
  }
  lightjs.info('<-- end backend setup ...');
}

/**
 * Updates the readme file for the server.
 *
 */
function updateReadmeFile() {
  const readmeMd = path.join(projectPath, swHelper.getBackendFolder(), swConst.README_MD);
  lightjs.info(`* update '${readmeMd}'`);

  shjs.cp(path.join(swConst.TEMPLATE_README, `README.${swHelper.isPhp() ? 'php' : 'java-kotlin'}.md`), readmeMd);

  const projectName = projectConfig.general.name;
  lightjs.replacement('{{PROJECT.NAME}}', projectName, [readmeMd]);
  lightjs.replacement('{{PROJECT.TITLE}}', projectName, [readmeMd]);
  lightjs.replacement('{{PROJECT.SERVERDIR}}', swHelper.getBackendFolder(), [readmeMd]);
}

exp.configure = configure;

module.exports = exp;
