# Changelog

## 2.0.0

* fully rewrite to use angular-cli internal structure
* the dependency project [angular-cli-for-swaaplate](https://github.com/inpercima/angular-cli-for-swaaplate) was removed
* the swaaplate.json structure was updated
  * root section `general` was moved behind root section `client`
  * `ghUser`, `language` and `useGoogleFonts` were added to `client`
  * `selectorPrefix` was renamed to `prefix`
  * `route` was renamed to `routing`
  * `enabled` was added to `routing`, `login` and `notFound`
  * `name` was added to `features`
  * `github` was removed from `general`
  * `useMITLicense` was added to `general`

## 1.1.1

* [bugfixes](https://github.com/inpercima/swaaplate/commit/863c85f691af6dc1d139823402b012d4d2a150cc)

## 1.1.0

* the swaaplate.json structure was updated
  * a new root section `client` was added
  * `buildWebDir` was moved to `client` and was renamed to `buildDir`
  * `installDependencies`, `selectorPrefix`,`theme` and `useYarn` were moved to `client`
  * root section `packageJson` was moved to `client`
  * `author`, `description` and `name` were moved to `general`
  * root section `route` was moved to `client`
  * `default` was moved to `features`
* a changelog file was created
* a migration guide was created
* a update routine was added
  * with `./swaaplate.js -u /absolute/path/to/project` you can update your general project files
