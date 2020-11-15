# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.0.2-SNAPSHOT (unreleased)

## 2.0.1 (2020-10-07)

* fixed: [Fix packagepath](https://github.com/inpercima/swaaplate/commit/7a30b1a0975463f5904396b1c12d44db07a8ecd5)
* added: [Add swaaplate generation website](https://github.com/inpercima/swaaplate/commit/54ba19622a09ed10877a1d647d808ad4da604983)
* fixed: [Refactoring](https://github.com/inpercima/swaaplate/commit/256a9bebdd9419efa6f5de71225d601cf673532f)
* changed: [Update version for project and templates](https://github.com/inpercima/swaaplate/commit/c11ef7c77e6368786980b526e26bacc3b8c802ca)
* changed: [Update website meta data](https://github.com/inpercima/swaaplate/commit/4915783168d4766129159e493b42f3d322429c93)
* added: [Initialize form](https://github.com/inpercima/swaaplate/commit/054b7b3a7bc2f8cebadeb4d3a112fbc6094f28b9)
* added: [Add server components and rename placeholder](https://github.com/inpercima/swaaplate/commit/d60d0634066aa818beeb3b0e65ccc7b7fbc0534c)
* changed: [Update angular-cli to 10.1.4 and angular-cdk to 10.2.4](https://github.com/inpercima/swaaplate/commit/9a83ec27b71e67e421e657262f2e0a3ec544716d)

## 2.0.0 (2020-09-27)

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
  * `htaccess` was renamed to `modRewritePhpExtension` and moved to `php`
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
