'use strict';

module.exports = Object.freeze({
  ANGULAR_BUILDERS_BROWSER: '@angular-builders/custom-webpack:browser',
  ANGULAR_BUILDERS_CUSTOM: '@angular-builders/custom-webpack',
  ANGULAR_DEVKIT_BROWSER: '@angular-devkit/build-angular:browser',
  ANGULAR_BUILDERS_SERVER: '@angular-builders/custom-webpack:dev-server',
  ANGULAR_DEVKIT_SERVER: '@angular-devkit/build-angular:dev-server',
  API_PATH_JAVA_KOTLIN: 'http://localhost:8080/',
  API_PATH_PHP_ROOT_API: './api/',
  API_PATH_PHP_ROOT: './',
  GITHUB_URL: 'https://github.com/',
  GITIGNORE_URL: 'https://www.gitignore.io/api/node,angular,eclipse,intellij+all',
  EXPORT_MOCK: `export NODE_ENV='mock'`,
  MOCK_DIR: 'mock',
  OR_HIGHER: 'or higher',
  SRC: 'src',
  SRC_ENVIRONMENTS: 'src/environments',
  SRC_APP: 'src/app/',
  SRC_MAIN: 'src/main',
  SRC_TEST: 'src/test',
  SRC_TEST_CLIENT: 'e2e/src',
  SW_AUTHOR: 'Marcel Jänicke',
  SW_USER: 'inpercima',
  SW_DESCRIPTION: '\\[s\\]imple \\[w\\]eb \\[a\\]pp \\[a\\]ngular tem\\[plate\\]. A very simple template generator for angular webapps with different backends.',
  SW_GENERATED: 'This project was generated with [swaaplate](https://github.com/inpercima/swaaplate) version',
  SW_MODULE: 'node_modules/angular-cli-for-swaaplate',
  SW_PACKAGE: 'net.inpercima.swaaplate',
  SW_TITLE: 'angular-cli-for-swaaplate',
  TEMPLATE_README: 'src/template/server/readme',
  THEME: 'indigo-pink',

  // by file
  ANGULAR_JSON: 'angular.json',
  AUTH_PHP: 'auth.php',
  AUTH_SERVICE_PHP: 'auth.service.php',
  APP_COMPONENT_TS: 'app.component.ts',
  APP_COMPONENT_SPEC_TS: 'app.component.spec.ts',
  APP_MODULE_TS: 'app.module.ts',
  APP_E2E_SPEC_TS: 'app.e2e-spec.ts',
  APP_PO_TS: 'app.po.ts',
  APPLICATION_DEV_YML: 'application-dev.yml',
  APPLICATION_PROD_YML: 'application-prod.yml',
  DB_JSON: 'db.json',
  DOT_GITIGNORE: '.gitignore',
  DOT_GRADLE: '.gradle',
  DOT_MVN: '.mvn',
  ENVIRONMENT_TS: 'environment.ts',
  ENVIRONMENT_DEV_TS: 'environment.dev.ts',
  ENVIRONMENT_MOCK_TS: 'environment.mock.ts',
  ENVIRONMENT_PROD_TS: 'environment.prod.ts',
  INDEX_HTML: 'index.html',
  KARMA_CONF_JS: 'karma.conf.js',
  LICENSE_MD: 'LICENSE.md',
  MIDDLEWARE_JS: 'middleware.js',
  PACKAGE_JSON: 'package.json',
  README_MD: 'README.md',
  POM_XML: 'pom.xml',
  STYLES_CSS: 'styles.css',
  SWAAPLATE_JSON: 'swaaplate.json',
  TSLINT_JSON: 'tslint.json',
  WEBPACK_CONFIG_JS: 'webpack.config.js',

  // by name
  APACHE: 'Apache',
  API: 'api',
  APP: 'app',
  CLIENT: 'client',
  DASHBOARD: 'dashboard',
  DEFAULT: 'default',
  DIST: 'dist',
  GRADLE: 'gradle',
  JAVA: 'java',
  JS: 'js',
  KOTLIN: 'kotlin',
  LOGIN: 'login',
  MAVEN: 'maven',
  NPM: 'npm',
  PHP: 'php',
  PRODUCTION: 'production',
  SERVER: 'server',
  SWAAPLATE: 'swaaplate',
  UPDATE: 'update',
  YARN: 'yarn',

  // by regular expression
  APP_ROOT: 'app(-root)',
  API_PATH: '\\.\\/',
  API_SUFFIX: '(apiSuffix: )\'\'',
  CONFIG_SHOW_FEATURES: '(showFeatures: )true',
  CONFIG_SHOW_LOGIN: '(showLogin: )false',
  CONFIG_LOGIN: '(activateLogin: )true',
  CONFIG_REDIRECT: '(redirectNotFound: )false',
  DEPENDENCY_LOGOS: '\\[!\\[dependencies.*\\s\\[.*\\s',
  GITIGNORE_BODY: '\\s# Created by https:.*((.|\\n)*)# End of https:.*\\s*',
  GIT_CLONE: '(git clone )(.*)',
  LINE_BREAK: '\\r?\\n\\s*\\n',
  ENV_FILE: `(environment.prod.ts)`,
  ENV_EXPORT: `\\r?\\n\\s*\\n(export)`,
  ENV_SPECIAL_CHARS: `(};)\\r?\\n\\s*\\n`,
  ENV_TS_REMOVE_FIRST_LINES: '\\/\\/\\sTh.*|\\/\\/\\s`n.*',
  ENV_TS_REMOVE_LAST_LINES: '\\/\\*.*|\\s\\*.*|\\/\\/.*',
  OLD_NEW_PART_1: '(\\./)(',
  OLD_NEW_PART_2: ')(/',
  OLD_NEW_PART_3: ')',
  OLD_PART_1: `(\\'|\\/|\\s)(`,
  OLD_PART_2: `)(\\'|\\.|-)`,
  OUTPUT_PATH: '("outputPath": "dist",)',
  REQUIREMENT: '(### Node, npm or yarn)',
  THIS_PROJECTS: 'This.+projects.\\s*',
  THIS_PROJECT: 'This project.+',
  README_MAIN: '\\s# install.*(.|\\n)*To create.*\\s*',
  REASON: '(\\| ------ \\|)',
  WHITESPACES: '(trim_trailing_whitespace = true)',

  // by module
  ANGULAR_BUILDERS: '8.2.0',
  // COPY_WEBPACK_PLUGIN version 5.x.x needs webpack 5.x.x but this is not released yet
  COPY_WEBPACK_PLUGIN: '4.6.0',
  DOCKER_VERSION: '17.05.0-ce',
  DOCKER_COMPOSE_VERSION: '1.9',
  MAVEN_VERSION: '3.6.2',
  MAVEN_WRAPPER: '0.5.5',
  PROJECT_VERSION: '0.0.1-SNAPSHOT',
  SPRING_BOOT: '2.2.0.RELEASE',
});