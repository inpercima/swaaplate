#!/usr/bin/env node
'use strict';

/* requirements */
const lightjs = require('light-js');
const swcore = require('./core/swaaplate.core.js');

/* init */
init();

/**
 * Initialize swaaplate.
 */
function init() {
  lightjs.info('initialize swaaplate');

  const swaaplateJsonData = lightjs.readJson('swaaplate.json');
  swcore.createProject(swaaplateJsonData);
}
