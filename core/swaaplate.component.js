'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
const replace = require('replace');
const shjs = require('shelljs');
const uppercamelcase = require('uppercamelcase');

let component = {};

/**
 * Configures the components of the app.
 *
 * @param {object} swaaplateJsonData 
 */
function configureComponents(swaaplateJsonData, projectDir) {
  const routes = ['dashboard', 'login', 'not-found'];
  const routeConfig = swaaplateJsonData.routeConfig;
  const configRoutes = [swaaplateJsonData.routeConfig.default, routeConfig.login.name, routeConfig.notFound.name];
  const srcDir = path.join(projectDir, 'src');
  const selectorPrefix = swaaplateJsonData.generalConfig.selectorPrefix;

  if (selectorPrefix !== 'app') {
    replace({ regex: 'app-root', replacement: `${selectorPrefix}-root`, paths: [
      path.join(srcDir, 'web/app.component.ts'),
      path.join(srcDir, 'index.html')
    ], silent: true });
    const tslintJson = path.join(projectDir, 'tslint.json');
    const tslintJsonData = lightjs.readJson(tslintJson);
    tslintJsonData.rules["directive-selector"] = [true, "attribute", selectorPrefix, "camelCase"];
    tslintJsonData.rules["component-selector"] = [true, "element", selectorPrefix, "kebab-case"];
    lightjs.writeJson(tslintJson, tslintJsonData);
  }
  for (let i = 0; i < routes.length; i++) {
    const template = `'${selectorPrefix}-${configRoutes[i]}'`;
    replace({ regex: `'app-${routes[i]}'`, replacement: template, paths: [path.join(srcDir, 'web')], silent: true, recursive: true });
    if (configRoutes[i] !== routes[i]) {
      updateComponent(swaaplateJsonData, projectDir, routes[i], configRoutes[i]);
    }
  }
}

function updateComponent(swaaplateJsonData, projectDir, oldName, newName) {
  lightjs.info(`update component '${oldName}' to '${newName}'`);

  const srcDir = path.join(projectDir, 'src/web', oldName === 'dashboard' ? 'features' : '');
  shjs.mv(path.join(srcDir, oldName), path.join(srcDir, newName));

  shjs.mv(path.join(srcDir, newName, `${oldName}.component.html`), path.join(srcDir, newName, `${newName}.component.html`));
  shjs.mv(path.join(srcDir, newName, `${oldName}.component.ts`), path.join(srcDir, newName, `${newName}.component.ts`));
  // changes not needed for dashboard
  if (oldName !== 'dashboard') {
    shjs.mv(path.join(srcDir, newName, `${oldName}.module.ts`), path.join(srcDir, newName, `${newName}.module.ts`));
    shjs.mv(path.join(srcDir, newName, `${oldName}-routing.module.ts`), path.join(srcDir, newName, `${newName}-routing.module.ts`));
  }
  // changes not needed for login
  if (oldName !== 'login') {
    replace({ regex: `${oldName}`, replacement: `${newName}`, paths: [
      path.join(srcDir, newName, `${newName}.component.html`)
    ], silent: true });
  }

  const oldUpper = uppercamelcase(oldName);
  const newUpper = uppercamelcase(newName);
  replace({ regex: `${oldUpper}Component`, replacement: `${newUpper}Component`, paths: [srcDir], silent: true, recursive: true });
  replace({ regex: `${oldUpper}Module`, replacement: `${newUpper}Module`, paths: [srcDir], silent: true, recursive: true });
  replace({ regex: `${oldUpper}RoutingModule`, replacement: `${newUpper}RoutingModule`, paths: [srcDir], silent: true, recursive: true });
  replace({ regex: `(\\'|\\/|\\s)(${oldName})(\\'|\\.|-)`, replacement: `$1${newName}$3`, paths: [srcDir], silent: true, recursive: true });
  replace({ regex: `(\\./)(${oldName})(/${newName})`, replacement: `$1${newName}$3`, paths: [srcDir], silent: true, recursive: true });

  // changes needed for login only after movement
  if (oldName === 'login') {
    replace({ regex: 'loginForm', replacement: `${newName}Form`, paths: [path.join(srcDir, newName)], silent: true, recursive: true });
  }
}

component.configureComponents = configureComponents;

module.exports = component;
