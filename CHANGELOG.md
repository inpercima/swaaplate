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
  * `route` was renamed to `routing`
  * `enabled` was added to `routing`, `login` and `notFound`
  * `name` was added to `features`
  * `github` was removed from `general`
  * `useMITLicense` was added to `general`
  * `useMock` was added to `general`
* removed: dependency project [angular-cli-for-swaaplate](https://github.com/inpercima/angular-cli-for-swaaplate)

## 1.1.1 (2020-01-20)

* fixed: [pass correct parameter to function to replace selectorPrefix](https://github.com/inpercima/swaaplate/commit/863c85f691af6dc1d139823402b012d4d2a150cc)
* fixed: [usage of yarn or npm to show it correct](https://github.com/inpercima/swaaplate/commit/863c85f691af6dc1d139823402b012d4d2a150cc)
* fixed: [syntax error to run app](https://github.com/inpercima/swaaplate/commit/863c85f691af6dc1d139823402b012d4d2a150cc)

## 1.1.0 (2019-12-27)

* changed: swaaplate.json structure
  * a new root section `client` was added
  * `buildWebDir` was moved to `client` and was renamed to `buildDir`
  * `installDependencies`, `selectorPrefix`,`theme` and `useYarn` were moved to `client`
  * root section `packageJson` was moved to `client`
  * `author`, `description` and `name` were moved to `general`
  * root section `route` was moved to `client`
  * `default` was moved to `features`
* added: changelog
* added: migration guide
* added: update routine
