'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');
const uppercamelcase = require('uppercamelcase');

const swConst = require('../root/const');
const swHelper = require('../root/helper');

let exp = {};
let projectConfig = {};
let projectPath = '';

/**
 * Generate modules and components.
 *
 * @param {object} pConfig
 * @param {string} pPath
 */
function generateModulesAndComponents(pConfig, pPath) {
  projectConfig = pConfig;
  projectPath = pPath;

  const modulesConfig = projectConfig.client.modules;
  if (swHelper.isRouting()) {
    lightjs.info('      option routing is activated, modules, components and routing will be generated');
    generateModuleAndComponent(true, modulesConfig.features.name, modulesConfig.features.defaultRoute);
    const notFoundConfig = modulesConfig.notFound;
    const notFoundName = notFoundConfig.name;
    generateModuleAndComponent(notFoundConfig.enabled, notFoundName, notFoundName);

    copyModuleFiles(swConst.APP);
    addRouteInformation(swConst.APP, null);
    replaceLinesInModule(swConst.APP, null);
  } else {
    lightjs.info('      option routing is deactivated, noting todo');
  }
}

/**
 * Generate a single module and component.
 *
 * @param {boolean} generate
 * @param {string} module
 * @param {string} component
 */
function generateModuleAndComponent(generate, module, component) {
  if (generate) {
    const pwd = shjs.pwd();
    shjs.cd(projectPath);

    lightjs.info(`... generate module '${module}'`);
    shjs.exec(`ng g m ${module} --routing=true`);
    lightjs.info(`... generate component '${component}'`);
    const moduleComponent = module === component ? module : `${module}/${component}`;
    shjs.exec(`ng g c ${moduleComponent}`);

    shjs.cd(pwd);

    copyModuleFiles(module);
    addRouteInformation(module, component);
    replaceLinesInModule(module, component);
  }
}

/**
 * Copy extra files for a module.
 *
 * @param {string} module
 */
function copyModuleFiles(module) {
  lightjs.info(`copy module files for '${module}'`);

  const templatePath = 'src/template/client/src';
  const appPath = path.join(projectPath, swConst.SRC, swConst.APP);
  if (module === swConst.APP) {
    shjs.cp('-r', path.join(templatePath, `${swConst.APP}*`), appPath);
  } else {
    shjs.cp('-r', path.join(templatePath, module, '*'), path.join(appPath, module));
  }
}

/**
 * Replace lines with double empty lines or add missing whitespaces.
 *
 */
function replaceLinesInModule(module, component) {
  const appPath = path.join(projectPath, swConst.SRC, swConst.APP);
  const moduleRoutingFile = `${module}-routing.module.ts`;
  const moduleFile = `${module}.module.ts`;
  const appDir =  module == swConst.APP ? '' : module;
  lightjs.replacement('\\n\\n\\n', os.EOL + os.EOL, [path.join(appPath, appDir, moduleFile)]);
  lightjs.replacement('\\n\\n\\n', os.EOL + os.EOL, [path.join(appPath, appDir, moduleRoutingFile)]);

  const componentName = module === projectConfig.client.modules.features.name ? uppercamelcase(component) : uppercamelcase(module);
  lightjs.replacement(`\\[(${componentName}Component)\\]`, '[ $1 ]', [path.join(appPath, appDir, moduleFile)]);
  if (module === swConst.APP) {
    lightjs.replacement('{{PROJECT.PREFIX}}', projectConfig.client.prefix, [path.join(appPath, appDir, `${module}.component.ts`)]);
  }
}

/**
 * Add route information to module.
 *
 * @param {string} module
 * @param {string} component
 */
function addRouteInformation(module, component) {
  lightjs.info(`add routes to module '${module}'`);

  const twoEol = os.EOL + os.EOL;
  const moduleName = uppercamelcase(module);
  const routingModuleFile = path.join(projectPath, swConst.SRC, module === swConst.APP ? '' : swConst.APP, module, `${module}-routing.module.ts`);

  const modulesConfig = projectConfig.client.modules;
  const featuresName = modulesConfig.features.name;
  const notFoundConfig = modulesConfig.notFound;
  const componentName = module === featuresName ? uppercamelcase(component) : moduleName;
  const routes = addRoute(module, componentName);
  lightjs.replacement('(Routes = \\[)', `$1${routes}`, [routingModuleFile]);

  const authGuardImport = module === featuresName && projectConfig.general.useSecurity ? `import { AuthGuard } from '../core/auth-guard.service';` : '';
  const componentFolder = module === featuresName ? `${component}/` : '';
  const componentImport = module === swConst.APP ? '' : `import { ${componentName}Component } from './${componentFolder}${component}.component';`;
  const environmentFolder = module === swConst.APP ? '' : '../';
  console.log(module, notFoundConfig.name);
  const environmentImport = module === notFoundConfig.name && notFoundConfig.enabled ? '' : `${os.EOL}import { environment } from '../${environmentFolder}environments/environment';`;
  lightjs.replacement(`(router';)`, `$1${twoEol}${authGuardImport}${componentImport}${environmentImport}`, [routingModuleFile]);

  const routingModule = `${moduleName}RoutingModule`;
  const typeRoutes = module === swConst.APP ? ': Routes' : '';
  const staticRoutes = `public static ROUTES${typeRoutes} = routes;`;
  lightjs.replacement(`(${routingModule} {) }`, `$1${twoEol}  ${staticRoutes}${twoEol}}`, [routingModuleFile]);

  lightjs.replacement(`\\[(RouterModule.*)\\]`, '[ $1 ]', [routingModuleFile]);
}

/**
 * Add route to module.
 *
 * @param {string} module
 * @param {string} componentName
 */
function addRoute(module, componentName) {
  const clientConfigModules = projectConfig.client.modules;
  const clientConfigNotFound = clientConfigModules.notFound;
  let routes = '';
  if (module === clientConfigNotFound.name && clientConfigNotFound.enabled) {
    routes = `{
  component: ${componentName}Component,
  path: '**',
}`;
  } else if (module === clientConfigModules.features.name) {
    routes = `{` + (projectConfig.general.useSecurity ? os.EOL + `  canActivate: [AuthGuard],` : '') + `
  component: ${componentName}Component,
  path: environment.defaultRoute,
}`;
  }
  else {
    routes = `{
  path: '',
  pathMatch: 'full',
  redirectTo: environment.defaultRoute,
}`;
  }
  return routes;
}

exp.generateModulesAndComponents = generateModulesAndComponents;

module.exports = exp;
