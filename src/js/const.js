'use strict';

module.exports = Object.freeze({
  // misc
  GITIGNORE_URL: 'https://www.gitignore.io/api/node,angular,eclipse,intellij+all',
  MOCK_DIR: 'mock',
  OR_HIGHER: 'or higher',
  SRC: 'src',
  SRC_MAIN: 'src/main',
  SRC_TEST: 'src/test',
  SRC_TEST_CLIENT: 'e2e/src',

  // sw specific
  SW_AUTHOR: 'Marcel Jänicke',
  SW_USER: 'inpercima',
  SW_DESCRIPTION: '\\[s\\]imple \\[w\\]eb \\[a\\]pp \\[a\\]ngular tem\\[plate\\]. A very simple template generator for angular webapps with different backends.',
  SW_GENERATED: 'This project was generated with [swaaplate](https://github.com/inpercima/swaaplate) version',
  SW_PACKAGE: 'net.inpercima.swaaplate',
  TEMPLATE_README: 'src/template/server/readme',
  THEME: 'indigo-pink',

  // by filename
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
  DOCKERFILE: 'Dockerfile',
  DOCKER_COMPOSE_YML: 'docker-compose.yml',
  DOT_EDITORCONFIG: '.editorconfig',
  DOT_GITATTRIBUTES: '.gitattributes',
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
  YARN_LOCK: 'yarn.lock',

  // by name
  APACHE: 'Apache',
  API: 'api',
  APP: 'app',
  CLIENT: 'client',
  DASHBOARD: 'dashboard',
  DEFAULT: 'default',
  DIST: 'dist',
  FEATURES: 'features',
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
  API_PATH: '\\.\\/',
  DEPENDENCY_LOGOS: '\\[!\\[dependencies.*\\s\\[.*\\s',
  GITIGNORE_BODY: '\\s# Created by https:.*((.|\\n)*)# End of https:.*\\s*',
  GIT_CLONE: '(git clone )(.*)',
  REQUIREMENT: '(### Node, npm or yarn)',
  THIS_PROJECT: 'This project.+',

  // by module
  ANGULAR_BUILDERS: '8.4.1',
  // COPY_WEBPACK_PLUGIN version 5.x.x needs webpack 5.x.x but this is not released yet
  COPY_WEBPACK_PLUGIN: '4.6.0',
  DOCKER_VERSION: '19.03.5',
  DOCKER_COMPOSE_VERSION: '1.25.0',
  PROJECT_VERSION: '1.0.0-SNAPSHOT',
  SPRING_BOOT: '2.2.4.RELEASE',
});
