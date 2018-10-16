'use strict';

/* requirements */
const lightjs = require('light-js');
const os = require('os');
const path = require('path');
const replace = require('replace');
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
    lightjs.replacement('import { fake.*\\s*', '', [appModuleTs]);
    lightjs.replacement('  providers.*\\s*.*\\s*.*\\s*}', '}', [appModuleTs]);
    shjs.rm(path.join(projectDir, 'src/web/app/login/fake-backend-interceptor.ts'));

    replace({ regex: `(import { map } from 'rxjs/operators';)`, replacement: `$1${os.EOL}${os.EOL}import { FormService } from './form.service';`, paths: [path.join(projectDir, 'src/app/core/auth.service.ts')], silent: true });
    replace({ regex: '(private http)', replacement: `private formService: FormService, $1`, paths: [path.join(projectDir, 'src/app/core/auth.service.ts')], silent: true });

    replace({ regex: `(import { map } from 'rxjs/operators';)`, replacement: `$1${os.EOL}${os.EOL}import { FormService } from './form.service';`, paths: [path.join(projectDir, 'src/app/core/auth.service.ts')], silent: true });
    replace({ regex: '(private http)', replacement: `private formService: FormService, $1`, paths: [path.join(projectDir, 'src/app/core/auth.service.ts')], silent: true });

    let post = `$1${os.EOL}    const body = this.formService.createBody(formGroup);${os.EOL}`;
    post += '    const header = this.formService.createHeader();';
    replace({ regex: '(Observable<boolean> {)', replacement: post, paths: [path.join(projectDir, 'src/app/core/auth.service.ts')], silent: true });
    replace({ regex: 'formGroup.value', replacement: 'body, header', paths: [path.join(projectDir, 'src/app/core/auth.service.ts')], silent: true });
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
  replace({ regex: 'net.inpercima.swaaplate', replacement: serverConfig.packagePath, paths: [
    path.join(projectDir, srcMain, endpointPath, `Application.${endpointExt}`),
    path.join(srcMainResources, 'logback.xml'),
  ], silent: true });

  const indentSizeEndpoint = endpoint === 'kotlin' ? 2 : 4;
  const config = `${os.EOL}${os.EOL}[logback.xml]${os.EOL}indent_size = 4${os.EOL}${os.EOL}[*.${endpointExt}]${os.EOL}indent_size = ${indentSizeEndpoint}`;
  const editorconfig = path.join(projectDir, '.editorconfig');
  replace({ regex: '(trim_trailing_whitespace = true)', replacement: `$1${config}`, paths: [editorconfig], silent: true });

  const authorMj = 'Marcel Jänicke';
  if (author !== authorMj) {
    replace({ regex: authorMj, replacement: author, paths: [path.join(srcMainEndpointPath, `Application.${endpointExt}`)], silent: true });
  }
}

function php(srcMain, projectDir) {
  lightjs.info(`use endpoint 'php', update webpack config and api-endpoint`);

  const srcMainPath = path.join(projectDir, srcMain);
  shjs.mkdir('-p', srcMainPath);
  shjs.cp('endpoint/php/*', srcMainPath);

  const copyWebpackPlugin = `$1${os.EOL}const CopyWebpackPlugin = require('copy-webpack-plugin');`;
  const webpackCommonJs = path.join(projectDir, 'webpack.common.js');
  // replace({ regex: '(Clean.*=.*)', replacement: copyWebpackPlugin, paths: [webpackCommonJs], silent: true });

  // const copyWebpackPluginSection = `$1${os.EOL}    new CopyWebpackPlugin([{${os.EOL}      from: './src/main',${os.EOL}    }]),`;
  // replace({ regex: '(new Clean.*)', replacement: copyWebpackPluginSection, paths: [webpackCommonJs], silent: true });

  const authServicePath = path.join(projectDir, 'src/app/core/auth.service.ts');
  replace({ regex: '\\/api\\/authenticate', replacement: './auth.handler.php?authenticate', paths: [authServicePath], silent: true });
}

endpoint.configureEndpoint = configureEndpoint;

module.exports = endpoint;
