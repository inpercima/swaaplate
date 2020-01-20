# Changelog

## 1.1.1

* [bugfixes](https://github.com/inpercima/swaaplate/commit/863c85f691af6dc1d139823402b012d4d2a150cc)

## 1.1.0

* updated swaaplate.json structure
  * added new root section `client`
  * `buildWebDir` moved to `client` and renamed to `buildDir`
  * `installDependencies`, `selectorPrefix`,`theme` and `useYarn` moved to `client`
  * root section `packageJson` moved to `client`
  * `author`, `description` and `name` moved to `general`
  * root section `route` moved to `client`
  * `default` moved to `features`
* created a changelog file
* created a migration guide
* added a update routine
  * with `./swaaplate.js -u /absolute/path/to/project` you can update your general project files
