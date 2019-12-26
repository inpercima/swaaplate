#!/usr/bin/env node
'use strict';

/* requirements */
const lightjs = require('light-js');
const swProject = require('./src/js/project.js');

/* init */
init();

/**
 * Initialize swaaplate.
 */
function init() {
  lightjs.info('initialize swaaplate');
  var args = process.argv.slice(2);
  if (args.length === 1) {
    lightjs.info('One parameter was found, use as absolute workspace path.');
    swProject.create(args[0]);
  } else if (args.length === 0) {
    lightjs.error('No absolute path was specified for the project!');
  } else if (args.length === 2 && args[0] === '-u') {
    lightjs.info('Two parameters were found, use first as updating the project, second as absolute workspace path.');
    swProject.update(args[1]);
  } else {
    lightjs.error('Too many parameters were specified. Only one parameter for the workspace path of the project is allowed!');
  }
}
