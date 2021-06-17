# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 2.2.2-SNAPSHOT (unreleased)

## 2.2.1 (2021-02-14)

fixed: [Add missing svg extension](https://github.com/inpercima/swaaplate/commit/ad26c3b32e5b84a89e6610ee10b1d85e256ffb84)
fixed: [Fix api or server link](https://github.com/inpercima/swaaplate/commit/439af3713647fcb9a6696e80f79c03fc8d7bddb6)
fixed: [Fix path from api/src/main to api/](https://github.com/inpercima/swaaplate/commit/c218f26c489ddda35238cbeb15dee9bac99a8ec1)
changed: [Update angular-cli and angular-material to 11.2.0](https://github.com/inpercima/swaaplate/commit/46cac94420d4edf51d9812d3bdbbafc1fec92f88)
changed: [Update webpack version info](https://github.com/inpercima/swaaplate/commit/1ad03ab80ed41a36eaa1cc39c77869039ac4f387)

## 2.2.0 (2021-02-12)

fixed: [Update client templates and syntax](https://github.com/inpercima/swaaplate/commit/4cb92aa1ad117e5ea53ecf5d7d15b0982d8a3c12)
fixed: [Ignore ".classpath", ".project" and "e2e/*js"](https://github.com/inpercima/swaaplate/commit/e307f2aeb9bf19d2a961134af9cbdd907f070198)
changed: [Update logging with spring boot and remove mysql connection not needed in default](https://github.com/inpercima/swaaplate/commit/f287c9006d04791103816ca98e07dca06119ffcf)
changed: [Update angular-cli to 11.1.4 and angular-material to 11.1.2](https://github.com/inpercima/swaaplate/commit/ab5f906c61b8103eded78d41a9a0e12fecba6ebd)
changed: [Update readme for docker with infos from other readme files](https://github.com/inpercima/swaaplate/commit/0047a8bb45eeb8866db899c837a5535db1181d8a)
changed: [Remove unessaccary environment apiSuffix in client](https://github.com/inpercima/swaaplate/commit/e93f1fe6a82f805c725ad02d2365250a0368be4b)
added: [Create backend folders config, rest and service and short src/main path to empty](https://github.com/inpercima/swaaplate/commit/8c00d8219755f40120eeffaf342d28427ebd1298)
added: [Include dev and prod config](https://github.com/inpercima/swaaplate/commit/5ce6082b319f73a54bdbe92196d8aa06908380a0)

## 2.1.0 (2020-11-18)

* changed: [Update version to 2.1.0](https://github.com/inpercima/swaaplate/commit/282de6c757cab82a51de4ed23533c28b1998569a)

## 2.0.2 (2020-11-18)

* fixed: [With java, editorconfig is missing java section](https://github.com/inpercima/swaaplate/issues/86)
* fixed: [Check bahaviour of htaccess with and without php](https://github.com/inpercima/swaaplate/issues/84)
* fixed: [File preparation: environment.prod.ts - remove double empty line](https://github.com/inpercima/swaaplate/issues/85)
* changed: [Update dependencies for angular-cli 11.0.1 and spring-boot 2.4.0](https://github.com/inpercima/swaaplate/commit/69696ab2b77d125eed77e278c96cc86d817891bf)
* changed: [With java, set version of java to 11 in pom and readme](https://github.com/inpercima/swaaplate/issues/87)
* added: [Php: add dev and prod config](https://github.com/inpercima/swaaplate/issues/88)

## 2.0.1 (2020-10-07)

* fixed: [Fix packagepath](https://github.com/inpercima/swaaplate/commit/7a30b1a0975463f5904396b1c12d44db07a8ecd5)
* fixed: [Refactoring](https://github.com/inpercima/swaaplate/commit/256a9bebdd9419efa6f5de71225d601cf673532f)
* changed: [Update version for project and templates](https://github.com/inpercima/swaaplate/commit/c11ef7c77e6368786980b526e26bacc3b8c802ca)
* changed: [Update angular-cli to 10.1.4 and angular-cdk to 10.2.4](https://github.com/inpercima/swaaplate/commit/9a83ec27b71e67e421e657262f2e0a3ec544716d)
* changed: [Update website meta data](https://github.com/inpercima/swaaplate/commit/4915783168d4766129159e493b42f3d322429c93)
* added: [Add swaaplate generation website](https://github.com/inpercima/swaaplate/commit/54ba19622a09ed10877a1d647d808ad4da604983)
* added: [Initialize form](https://github.com/inpercima/swaaplate/commit/054b7b3a7bc2f8cebadeb4d3a112fbc6094f28b9)
* added: [Add server components and rename placeholder](https://github.com/inpercima/swaaplate/commit/d60d0634066aa818beeb3b0e65ccc7b7fbc0534c)

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
