'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');
const uppercamelcase = require('uppercamelcase');

const swProjectConst = require('../root/project.const');
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

  const architectureConfig = projectConfig.frontend.architecture;
  if (architectureConfig.standalone) {
    lightjs.info('      option standalone is activated, no modules and extra components will be generated');
    // tbd
  } else {
    lightjs.info('      option standalone is deactivated, modules will be generated');
    if (swHelper.isRouting()) {
      lightjs.info('      option routing is activated, routing will be generated');
    } else {
      lightjs.info('      option routing is deactivated, routing will not be generated');
    }
    const featuresConfig = architectureConfig.modules.features;
    generateModuleAndComponent(featuresConfig.name, featuresConfig.firstComponent);
    const notFoundConfig = architectureConfig.modules.notFound;
    if (notFoundConfig.enabled) {
      const notFoundName = notFoundConfig.name;
      generateModuleAndComponent(notFoundName, notFoundName);
    }

    copyModuleFiles(swProjectConst.APP);
    if (swHelper.isRouting()) {
      addRouteInformation(swProjectConst.APP, null);
    }
    replaceLinesInModule(swProjectConst.APP, null);
  }
}

/**
 * Generate a single module and component.
 *
 * @param {string} module
 * @param {string} component
 */
function generateModuleAndComponent(module, component) {
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

/**
 * Copy extra files for a module.
 *
 * @param {string} module
 */
function copyModuleFiles(module) {
  lightjs.info(`copy module files for '${module}'`);

  const templatePath = 'src/template/frontend/src';
  const appPath = path.join(projectPath, swProjectConst.SRC, swProjectConst.APP);
  if (module === swProjectConst.APP) {
    shjs.cp('-r', path.join(templatePath, `${swProjectConst.APP}.*`), appPath);
    if (swHelper.isRouting()) {
      shjs.cp('-r', path.join(templatePath, `${swProjectConst.APP}-routing*`), appPath);
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
  const appPath = path.join(projectPath, swProjectConst.SRC, swProjectConst.APP);
  const moduleFile = `${module}.module.ts`;
  const appDir =  module == swProjectConst.APP ? '' : module;
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

  const frontendConfig = projectConfig.frontend;
  const featuresName = frontendConfig.architecture.modules.features.name;
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
  if (module === swProjectConst.APP) {
    lightjs.replacement('{{PROJECT.PREFIX}}', frontendConfig.prefix, [path.join(appPath, appDir, `${module}.component.ts`)]);
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
  const routingModuleFile = path.join(projectPath, swProjectConst.SRC, module === swProjectConst.APP ? '' : swProjectConst.APP, module, `${module}-routing.module.ts`);

  const modulesConfig = projectConfig.frontend.architecture.modules;
  const featuresName = modulesConfig.features.name;
  const notFoundConfig = modulesConfig.notFound;
  const componentName = module === featuresName ? uppercamelcase(component) : moduleName;
  const routes = addRoute(module, componentName);
  lightjs.replacement('(Routes = \\[)', `$1${routes}`, [routingModuleFile]);

  const authGuardImport = module === featuresName && projectConfig.general.useSecurity ? `import { AuthGuard } from '../core/auth-guard.service';` : '';
  const componentFolder = module === featuresName ? `${component}/` : '';
  const componentImport = module === swProjectConst.APP ? '' : `import { ${componentName}Component } from './${componentFolder}${component}.component';`;
  const environmentFolder = module === swProjectConst.APP ? '' : '../';
  const environmentImport = module === notFoundConfig.name && notFoundConfig.enabled ? '' : `${os.EOL}import { environment } from '../${environmentFolder}environments/environment';`;
  lightjs.replacement(`(router';)`, `$1${twoEol}${authGuardImport}${componentImport}${environmentImport}`, [routingModuleFile]);

  const routingModule = `${moduleName}RoutingModule`;
  const typeRoutes = module === swProjectConst.APP ? ': Routes' : '';
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
  const modulesConfig = projectConfig.frontend.architecture.modules;
  const notFoundConfig = modulesConfig.notFound;
  let routes = '';
  if (module === notFoundConfig.name && notFoundConfig.enabled) {
    routes = `{
  component: ${componentName}Component,
  path: '**',
}`;
  } else if (module === modulesConfig.features.name) {
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
