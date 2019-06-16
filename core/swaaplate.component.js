'use strict';

/* requirements */
const lightjs = require('light-js');
const path = require('path');
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
  const selectorPrefix = swaaplateJsonData.generalConfig.selectorPrefix;
  const appPath = path.join(projectDir, swaaplateJsonData.serverConfig.endpoint === 'js' ? '' : 'client');
  const appSrcPath = path.join(appPath, 'src');

  if (selectorPrefix !== 'app') {
    lightjs.replacement('app-root', `${selectorPrefix}-root`, [
      path.join(appSrcPath, 'app/app.component.ts'),
      path.join(appSrcPath, 'index.html')
    ]);
    const tslintJson = path.join(appPath, 'tslint.json');
    const tslintJsonData = lightjs.readJson(tslintJson);
    tslintJsonData.rules["directive-selector"] = [true, "attribute", selectorPrefix, "camelCase"];
    tslintJsonData.rules["component-selector"] = [true, "element", selectorPrefix, "kebab-case"];
    lightjs.writeJson(tslintJson, tslintJsonData);
  }
  for (let i = 0; i < routes.length; i++) {
    const template = `'${selectorPrefix}-${configRoutes[i]}'`;
    lightjs.replacement(`'app-${routes[i]}'`, template, [path.join(appSrcPath, 'app')], true, true);
    if (configRoutes[i] !== routes[i]) {
      updateComponent(appSrcPath, routes[i], configRoutes[i]);
    }
  }
}

function updateComponent(appPath, oldName, newName) {
  lightjs.info(`update component '${oldName}' to '${newName}'`);

  const srcDir = path.join(appPath, 'app', oldName === 'dashboard' ? 'features' : '');
  shjs.mv(path.join(srcDir, oldName), path.join(srcDir, newName));

  shjs.mv(path.join(srcDir, newName, `${oldName}.component.html`), path.join(srcDir, newName, `${newName}.component.html`));
  shjs.mv(path.join(srcDir, newName, `${oldName}.component.ts`), path.join(srcDir, newName, `${newName}.component.ts`));
  shjs.mv(path.join(srcDir, newName, `${oldName}.component.spec.ts`), path.join(srcDir, newName, `${newName}.component.spec.ts`));
  // changes not needed for dashboard
  if (oldName !== 'dashboard') {
    shjs.mv(path.join(srcDir, newName, `${oldName}.module.ts`), path.join(srcDir, newName, `${newName}.module.ts`));
    shjs.mv(path.join(srcDir, newName, `${oldName}.module.spec.ts`), path.join(srcDir, newName, `${newName}.module.spec.ts`));
    shjs.mv(path.join(srcDir, newName, `${oldName}-routing.module.ts`), path.join(srcDir, newName, `${newName}-routing.module.ts`));
    shjs.mv(path.join(srcDir, newName, `${oldName}-routing.module.spec.ts`), path.join(srcDir, newName, `${newName}-routing.module.spec.ts`));
  }
  // changes not needed for login
  if (oldName !== 'login') {
    lightjs.replacement(`${oldName}`, `${newName}`, [path.join(srcDir, newName, `${newName}.component.html`)]);
  }

  // special for login
  if (oldName === 'login') {
    lightjs.replacement(`(\\./)(login)(/fake)`, `$1${newName}$3`, [path.join(srcDir, 'app.module.ts')]);
  }

  const oldUpper = uppercamelcase(oldName);
  const newUpper = uppercamelcase(newName);
  lightjs.replacement(`${oldUpper}Component`, `${newUpper}Component`, [srcDir], true, true);
  lightjs.replacement(`${oldUpper}Module`, `${newUpper}Module`, [srcDir], true, true);
  lightjs.replacement( `${oldUpper}RoutingModule`, `${newUpper}RoutingModule`, [srcDir], true, true);
  lightjs.replacement(`(\\'|\\/|\\s)(${oldName})(\\'|\\.|-)`, `$1${newName}$3`, [srcDir], true, true);
  lightjs.replacement(`(\\./)(${oldName})(/${newName})`, `$1${newName}$3`, [srcDir], true, true);

  lightjs.replacement(`${oldName}Module`, `${newName}Module`, [srcDir], true, true);
  lightjs.replacement(`${oldName}RoutingModule`, `${newName}RoutingModule`, [srcDir], true, true);

  // changes needed for login only after movement
  if (oldName === 'login') {
    lightjs.replacement('loginForm', `${newName}Form`, [path.join(srcDir, newName)]);
  }
}

component.configureComponents = configureComponents;

module.exports = component;
