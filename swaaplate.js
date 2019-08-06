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
  var args = process.argv.slice(2);
  if (args.length === 1) {
    const swaaplateJsonData = lightjs.readJson('swaaplate.json');
    swcore.createProject(swaaplateJsonData, args[0]);
  } else if (args.length === 0) {
    lightjs.error('Es wurde kein absoluter Pfad für das Projekt angegeben!');
  } else {
    lightjs.error('Zu viele Parameter wurden angegeben. Nur ein Parameter für den Pfad des Projekts ist zulässig!');
  }
}
