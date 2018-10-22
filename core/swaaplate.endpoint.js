'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const shjs = require('shelljs');

let endpoint = {};

/**
 * Configures the endpoint of the app.
 *
 * @param {object} swaaplateJsonData
 */
function configureEndpoint(swaaplateJsonData, projectDir) {
  const serverConfig = swaaplateJsonData.serverConfig;
  // java, kotlin and php
  const srcMain = 'src/main/';
  if (serverConfig.endpoint !== 'js') {
    shjs.mv(path.join(projectDir, 'src'), path.join(projectDir, 'web'));
    shjs.mkdir('-p', path.join(projectDir, 'src'));
    shjs.mv(path.join(projectDir, 'web'), path.join(projectDir, 'src/'));

    const tsConfigAppJson = path.join(projectDir, 'src/web/tsconfig.app.json');
    lightjs.replacement('(tsconfig.json)', '../$1', [tsConfigAppJson]);
    lightjs.replacement('(out-tsc)', '../$1', [tsConfigAppJson]);
    const tsConfigSpecJson = path.join(projectDir, 'src/web/tsconfig.spec.json');
    lightjs.replacement('(tsconfig.json)', '../$1', [tsConfigSpecJson]);
    lightjs.replacement('(out-tsc)', '../$1', [tsConfigSpecJson]);
  }
  // java or kotlin
  if (serverConfig.endpoint === 'java' || serverConfig.endpoint === 'kotlin') {
    javaKotlin(srcMain, projectDir, serverConfig, swaaplateJsonData.packageJsonConfig.author);
  }
  // php
  if (serverConfig.endpoint === 'php') {
    php(srcMain, projectDir);
  }
  // java, kotlin and php
  if (serverConfig.endpoint !== 'js') {
    lightjs.info('remove all unneeded dependencies and replace code for chosen endpoint');

    const appModuleTs = path.join(projectDir, 'src/web/app/app.module.ts');
    lightjs.replacement('import { fake.*\\s*', os.EOL, [appModuleTs]);
    lightjs.replacement('  providers.*\\s*.*\\s*.*\\s*}', '}', [appModuleTs]);
    shjs.rm(path.join(projectDir, 'src/web/app/login/fake-backend-interceptor.ts'));

    const authServiceTs = path.join(projectDir, 'src/web/app/core/auth.service.ts');
    lightjs.replacement(`(import { map } from 'rxjs/operators';)`, `$1${os.EOL}${os.EOL}import { FormService } from './form.service';`, [authServiceTs]);
    lightjs.replacement('(private http)', `private formService: FormService, $1`, [authServiceTs]);

    let post = `$1${os.EOL}    const body = this.formService.createBody(formGroup);${os.EOL}`;
    post += '    const header = this.formService.createHeader();';
    lightjs.replacement('(Observable<boolean> {)', post, [authServiceTs]);
    lightjs.replacement('formGroup.value', 'body, header', [authServiceTs]);
  }
  // js
  if (serverConfig.endpoint === 'js') {
    lightjs.info(`use endpoint 'js', nothing special todo`);
  }
}

function javaKotlin(srcMain, projectDir, serverConfig, author) {
  const endpoint = serverConfig.endpoint;
  lightjs.info(`use endpoint '${endpoint}', create 'src/main/..' and 'src/test/..'`);

  const endpointPath = path.join(endpoint, serverConfig.packagePath.replace(/\./g, '/'));
  const srcMainEndpointPath = path.join(projectDir, srcMain, endpointPath);
  const srcMainResources = path.join(projectDir, srcMain, 'resources');
  shjs.mkdir('-p', srcMainEndpointPath);

  const endpointExt = endpoint === 'kotlin' ? 'kt' : endpoint;
  shjs.cp(`endpoint/${endpoint}/Application.${endpointExt}`, srcMainEndpointPath);
  shjs.mkdir('-p', srcMainResources);
  shjs.cp('endpoint/java-kotlin/logback.xml', srcMainResources);
  shjs.cp('endpoint/java-kotlin/application.yml', srcMainResources);

  const srcTest = 'src/test/';
  shjs.mkdir('-p', path.join(projectDir, srcTest, endpointPath));
  shjs.mkdir('-p', path.join(projectDir, srcTest, 'resources'));
  lightjs.replacement('net.inpercima.swaaplate', serverConfig.packagePath, [
    path.join(projectDir, srcMain, endpointPath, `Application.${endpointExt}`),
    path.join(srcMainResources, 'logback.xml'),
  ]);

  const indentSizeEndpoint = endpoint === 'kotlin' ? 2 : 4;
  const config = `${os.EOL}${os.EOL}[logback.xml]${os.EOL}indent_size = 4${os.EOL}${os.EOL}[*.${endpointExt}]${os.EOL}indent_size = ${indentSizeEndpoint}`;
  const editorconfig = path.join(projectDir, '.editorconfig');
  lightjs.replacement('(trim_trailing_whitespace = true)', `$1${config}`, [editorconfig]);

  const authorMj = 'Marcel Jänicke';
  if (author !== authorMj) {
    lightjs.replacement(authorMj, author, [path.join(srcMainEndpointPath, `Application.${endpointExt}`)]);
  }
}

function php(srcMain, projectDir) {
  lightjs.info(`use endpoint 'php', update webpack config and api-endpoint`);

  const srcMainPath = path.join(projectDir, srcMain);
  shjs.mkdir('-p', srcMainPath);
  shjs.cp('endpoint/php/*', srcMainPath);

  const copyWebpackPlugin = `$1${os.EOL}const CopyWebpackPlugin = require('copy-webpack-plugin');`;
  const webpackConfigJs = path.join(projectDir, 'webpack.config.js');
  lightjs.replacement('(webpack.*=.*)', copyWebpackPlugin, [webpackConfigJs]);

  const copyWebpackPluginSection = `$1${os.EOL}  plugins: [${os.EOL}    new CopyWebpackPlugin([{${os.EOL}      from: './src/main',${os.EOL}    }]),${os.EOL}  ],`;
  lightjs.replacement('(},)', copyWebpackPluginSection, [webpackConfigJs]);

  const authServicePath = path.join(projectDir, 'src/web/app/core/auth.service.ts');
  lightjs.replacement('\\/api\\/authenticate', './auth.handler.php?authenticate', [authServicePath]);
}

endpoint.configureEndpoint = configureEndpoint;

module.exports = endpoint;
