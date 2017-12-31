'use strict';

/* requirements */
const os = require('os');
const replace = require('replace');
const shjs = require('shelljs');
const sTools = require('./swaaplate-tools');

/* init */
init();
sTools.load(true);

function init() {
  sTools.infoLog('initialize swaaplate');
  const swaaplateJsonData = sTools.readJson('swaaplate.json');
  const outputDir = swaaplateJsonData.workData.outputDir
  const projectName = swaaplateJsonData.projectData.name;
  const projectDir = outputDir + projectName;
  const packageJson = 'package.json';
  createAndCopyProject(projectDir, outputDir, projectName);
  const packageJsonData = updatePackageJsonData(projectDir, packageJson, swaaplateJsonData.projectData);
  replaceData(projectDir, packageJsonData, swaaplateJsonData.projectData);
  updateConfigJsonData(projectDir, swaaplateJsonData.projectData);
  doExtendedServices(swaaplateJsonData.projectData.serverComponent);
}

function createAndCopyProject(projectDir, outputDir, projectName) {
  sTools.infoLog(`create project '${projectName}' in '${outputDir}'`);
  shjs.mkdir('-p', projectDir);
  shjs.cp('-r', 'files/*', projectDir);
  shjs.cp('files/.*', projectDir);
  shjs.cp('swaaplate-tools.js', projectDir);
  shjs.cp('swaaplate-update.js', projectDir);
  shjs.cp('swaaplate-update.json', projectDir);
  shjs.cd(projectDir);
}

function updatePackageJsonData(projectDir, packageJson, projectData) {
  sTools.infoLog(`update '${projectDir}/${packageJson}'`);
  const packageJsonData = sTools.readJson(packageJson);
  packageJsonData.author = projectData.author;
  packageJsonData.contributors[0].email = projectData.contributorEmail;
  packageJsonData.contributors[0].name = projectData.contributorName;
  packageJsonData.description = projectData.description;
  packageJsonData.homepage = projectData.homepage;
  packageJsonData.name = projectData.name;
  packageJsonData.repository = projectData.repository;
  sTools.writeJson(packageJson, packageJsonData);
  return packageJsonData;
}

function updateConfigJsonData(projectDir, projectData) {
  const configDefault = 'config/config.default.json';
  const config = 'config/config.json';
  sTools.infoLog(`update ${projectDir}/${configDefault}`);
  const configJsonData = sTools.readJson(configDefault);
  configJsonData.activateLogin = projectData.config.activateLogin;
  configJsonData.appname = projectData.name;
  configJsonData.routes = projectData.config.routes;
  configJsonData.theme = projectData.config.theme;
  sTools.writeJson(configDefault, configJsonData);
  sTools.infoLog(`create ${projectDir}/${config}`);
  shjs.cp(configDefault, config);
}

function replaceData(projectDir, packageJsonData, projectData) {
  sTools.infoLog(`update files in '${projectDir}' with project data`);
  replace({ regex: 'PROJECTDATA_AUTHOR', replacement: packageJsonData.author, paths: ['LICENSE.md'], silent: true });
  replace({ regex: 'PROJECTDATA_BUILDDIR', replacement: projectData.buildDir, paths: [
    'webpack.common.js',
    'config/webpack.dev.js',
    '.gitignore',
  ], silent: true });
  const name = packageJsonData.name;
  let cloneUrl = `https://anyurl/${name}`;
  let description = '';
  if (projectData.github.useAccount) {
    const username = projectData.github.username;
    description = `[![dependencies Status](https://david-dm.org/${username}/${name}/status.svg)](https://david-dm.org/${username}/${name})`;
    description += `${os.EOL}[![dependencies Status](https://david-dm.org/${username}/${name}/dev-status.svg)](https://david-dm.org/${username}/${name}?type=dev)${os.EOL}`;
    cloneUrl = `https://github.com/${username}/${name}`;
  }
  description += os.EOL + packageJsonData.description;
  replace({ regex: 'PROJECTDATA_CLONEURL', replacement: cloneUrl, paths: ['README.md'], silent: true });
  replace({ regex: 'PROJECTDATA_COMPONENTSHORT', replacement: projectData.componentShort, paths: ['client/index.html', 'client/app/components/'], silent: true, recursive: true });
  replace({ regex: 'PROJECTDATA_DESCRIPTION', replacement: description, paths: ['README.md'], silent: true });
  replace({ regex: 'PROJECTDATA_NAME', replacement: name, paths: ['README.md'], silent: true });
}

function doExtendedServices(serverComponent) {
  const useServer = serverComponent.useServer;
  if (useServer) {
    sTools.infoLog('create server component');
    shjs.mkdir('server');
  }
  replace({ regex: 'PROJECTDATA_AUTHENTICATEURL', replacement: useServer ? serverComponent.authenticateUrl : '', paths: ['client/app/services/auth.service.ts'], silent: true });
  const fromServer = `${os.EOL}      {${os.EOL}        from: './src/server',${os.EOL}      },`;
  replace({ regex: 'PROJECTDATA_SERVER', replacement: useServer ? fromServer : '', paths: ['webpack.common.js'], silent: true });
}
