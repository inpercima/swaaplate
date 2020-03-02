#!/usr/bin/env node
'use strict';

/* requirements */
const lightjs = require('light-js');

const swProject = require('./src/js/project.js');

/* init */
init();

/**
 * Initialize swaaplate.
 *
 */
function init() {
  lightjs.info('initialize swaaplate');
  var args = process.argv.slice(2);
  if (args.length === 1) {
    lightjs.info('one parameter was found, use as absolute workspace path');
    swProject.create(args[0]);
  } else if (args.length === 0) {
    lightjs.error('no absolute path was specified for the project');
  } else if (args.length === 2 && args[0] === '-u') {
    lightjs.info('two parameters were found, use first as updating the project, second as absolute workspace path');
    // swProject.update(args[1]);
    lightjs.warn('the update process is in version 2.0.0 not available');
  } else {
    lightjs.error('too many parameters were specified, one parameter for the workspace path of the project is allowed only');
  }
}
