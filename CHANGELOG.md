# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.0.0-SNAPSOT (unreleased)

* changed: fully rewrite to use angular-cli internal structure
* changed: swaaplate.json structure
  * root section `general` was moved behind root section `client`
  * `ghUser`, `language` and `useGoogleFonts` were added to `client`
  * `selectorPrefix` was renamed to `prefix`
  * `login` was removed from `route`
  * `route` was renamed to `modules` and moved behind `language`
  * `enabled` and `routing` were added to `modules`
  * `name` was added to `features`
  * `default` was renamed to `defaultRoute` in `features`
  * `show` was removed from `features`
  * `github` was removed from `general`
  * `modRewriteIndex`, `useMITLicense`, `useMock` and `useSecurity` were added to `general`
  * sections `javaKt` and `php`were added to `server`
  * `management` and `packagePath` were moved to `javaKt`
  * `htaccess` was renamed to `modRewritePhpExtension` moved to `php`
  * `serverAsApi` was moved to `php`
* removed: dependency project [angular-cli-for-swaaplate](https://github.com/inpercima/angular-cli-for-swaaplate)

## 1.1.1 (2020-01-20)

* fixed: [pass correct parameter to function to replace selectorPrefix](https://github.com/inpercima/swaaplate/commit/863c85f691af6dc1d139823402b012d4d2a150cc)
* fixed: [usage of yarn or npm to show it correct](https://github.com/inpercima/swaaplate/commit/863c85f691af6dc1d139823402b012d4d2a150cc)
* fixed: [syntax error to run app](https://github.com/inpercima/swaaplate/commit/863c85f691af6dc1d139823402b012d4d2a150cc)

## 1.1.0 (2019-12-27)

* changed: swaaplate.json structure
  * a new root section `client` was added
  * `buildWebDir` was moved to `client` and renamed to `buildDir`
  * `installDependencies`, `selectorPrefix`,`theme` and `useYarn` were moved to `client`
  * root section `packageJson` was moved to `client`
  * `author`, `description` and `name` were moved to `general`
  * root section `route` was moved to `client`
  * `default` was moved to `features`
* added: changelog
* added: migration guide
* added: update routine
