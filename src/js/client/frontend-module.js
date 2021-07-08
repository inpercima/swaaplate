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
  if (modulesConfig.enabled) {
    lightjs.info('      option modules is activated, modules, components will be generated');
    if (swHelper.isRouting()) {
      lightjs.info('      option routing is activated, routing will be generated');
    } else {
      lightjs.info('      option routing is deactivated, noting todo');
    }
    const featuresConfig = modulesConfig.features;
    generateModuleAndComponent(true, featuresConfig.name, featuresConfig.defaultRoute);
    const notFoundConfig = modulesConfig.notFound;
    const notFoundName = notFoundConfig.name;
    generateModuleAndComponent(swHelper.isRouting() && notFoundConfig.enabled, notFoundName, notFoundName);

    copyModuleFiles(swConst.APP);
    if (swHelper.isRouting()) {
      addRouteInformation(swConst.APP, null);
    }
    replaceLinesInModule(swConst.APP, null);
  } else {
    lightjs.info('      option modules is deactivated, noting todo');
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
    shjs.exec(`ng g m ${module} --routing=${swHelper.isRouting()}`);
    lightjs.info(`... generate component '${component}'`);
    const moduleComponent = module === component ? module : `${module}/${component}`;
    shjs.exec(`ng g c ${moduleComponent}`);

    shjs.cd(pwd);

    copyModuleFiles(module);
    if (swHelper.isRouting()) {
      addRouteInformation(module, component);
    }
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
    shjs.cp('-r', path.join(templatePath, `${swConst.APP}.*`), appPath);
    if (swHelper.isRouting()) {
      shjs.cp('-r', path.join(templatePath, `${swConst.APP}-routing*`), appPath);
    }
  } else {
    shjs.cp('-r', path.join(templatePath, module, `${module}.*`), path.join(appPath, module));
    if (swHelper.isRouting()) {
      shjs.cp('-r', path.join(templatePath, module, `${module}-routing*`), path.join(appPath, module));
    }
  }
}

/**
 * Replace lines with double empty lines or add missing whitespaces generate by ng in module file.
 *
 */
function replaceLinesInModule(module, component) {
  const appPath = path.join(projectPath, swConst.SRC, swConst.APP);
  const moduleFile = `${module}.module.ts`;
  const appDir =  module == swConst.APP ? '' : module;
  const moduleFilePath = path.join(appPath, appDir, moduleFile);
  lightjs.replacement('\\n\\n\\n', os.EOL + os.EOL, [moduleFilePath]);
  if (!swHelper.isRouting()) {
    lightjs.replacement('(    CommonModule)', '$1,', [moduleFilePath]);
    lightjs.replacement(`(common';)`, `$1${os.EOL}`, [moduleFilePath]);
  }

  if (swHelper.isRouting()) {
    const moduleRoutingFile = `${module}-routing.module.ts`;
    lightjs.replacement('\\n\\n\\n', os.EOL + os.EOL, [path.join(appPath, appDir, moduleRoutingFile)]);
  }

  const clientConfig = projectConfig.client;
  const featuresName = clientConfig.modules.features.name;
  const componentName = module === featuresName ? uppercamelcase(component) : uppercamelcase(module);

  // add a comma at the end of component name
  lightjs.replacement(`(    ${componentName}Component)`, '$1,', [moduleFilePath]);
  // the command above will also change AppModule so just simple remove double comma
  lightjs.replacement('(AppComponent),,', '$1,', [moduleFilePath]);

  if (!swHelper.isRouting() && module === featuresName) {
    lightjs.replacement(`(imports)`, `exports: [${os.EOL}    ${componentName}Component,${os.EOL}  ],${os.EOL}  $1`, [moduleFilePath]);
    // add a comma at the end of square bracket
    lightjs.replacement(`]`, '],', [moduleFilePath]);
    // the command above will also change exiting square brackets with comma so rechange it
    lightjs.replacement('],,', '],', [moduleFilePath]);
  }
  if (module === swConst.APP) {
    lightjs.replacement('{{PROJECT.PREFIX}}', clientConfig.prefix, [path.join(appPath, appDir, `${module}.component.ts`)]);
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
  const environmentImport = module === notFoundConfig.name && notFoundConfig.enabled ? '' : `${os.EOL}import { environment } from '../${environmentFolder}environments/environment';`;
  lightjs.replacement(`(router';)`, `$1${twoEol}${authGuardImport}${componentImport}${environmentImport}`, [routingModuleFile]);

  const routingModule = `${moduleName}RoutingModule`;
  const typeRoutes = module === swConst.APP ? ': Routes' : '';
  const staticRoutes = `static ROUTES${typeRoutes} = routes;`;
  lightjs.replacement(`(${routingModule} {) }`, `$1${twoEol}  ${staticRoutes}${os.EOL}}`, [routingModuleFile]);

  lightjs.replacement(`\\[(RouterModule.*)\\].*`, `[${os.EOL}    $1,${os.EOL}  ],`, [routingModuleFile]);
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
