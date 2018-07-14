# swaaplate

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)
[![dependencies Status](https://david-dm.org/inpercima/swaaplate/status.svg)](https://david-dm.org/inpercima/swaaplate)
[![devDependencies Status](https://david-dm.org/inpercima/swaaplate/dev-status.svg)](https://david-dm.org/inpercima/swaaplate?type=dev)

[s]imple [w]eb [a]pp [a]ngular tem[plate]. A very simple template generator for angular webapps.

Projects like [publicmedia](https://github.com/inpercima/publicmedia), [mittagstisch](https://github.com/inpercima/mittagstisch) or [run-and-fun-2](https://github.com/inpercima/run-and-fun-2) are build on it.

## Benefits of swaaplate

With swaaplate, the goal should be to create an Angular web app with a selected backend.
Which techniques, languages and tools are to be used can be selected and appropriately combined.

Currently the following combinations are possible.
* `Angular` - `js` - `npm`
* `Angular` - `js` - `yarn`
* `Angular` - `php` - `npm`
* `Angular` - `php` - `yarn`
* `Angular` - `java (Spring-Boot)` - `npm`
* `Angular` - `java (Spring-Boot)` - `yarn`
* `Angular` - `java (Spring-Boot)` - `maven` - `npm`
* `Angular` - `java (Spring-Boot)` - `maven` - `yarn`
* `Angular` - `java (Spring-Boot)` - `gradle` - `npm` in development
* `Angular` - `java (Spring-Boot)` - `gradle` - `yarn` in development
* `Angular` - `kotlin (Spring-Boot)` - `npm`
* `Angular` - `kotlin (Spring-Boot)` - `yarn`
* `Angular` - `kotlin (Spring-Boot)` - `maven` - `npm`
* `Angular` - `kotlin (Spring-Boot)` - `maven` - `yarn`
* `Angular` - `kotlin (Spring-Boot)` - `gradle` - `npm` in development
* `Angular` - `kotlin (Spring-Boot)` - `gradle` - `yarn`  in development

## Prerequisites

* `node 8.11.3` or higher in combination with
  * `npm 5.6.0` or higher or
  * `yarn 1.7.0` or higher, used in this repository

## Getting started

```
# clone project
git clone https://github.com/inpercima/swaaplate
cd swaaplate

# copy core/swaaplate.default.json to swaaplate.json
cp core/swaaplate.default.json swaaplate.json

# install tools
yarn

# change data in swaaplate.json (more info see in configuration) and run swaaplate
node swaaplate.js
```

## Configuration

### General

All options have to bet set but some of them do not need to be changed.
Some of this options will be copied in `config.json` of the new project and can be changed later.

### Table of contents

* [generalConfig/buildWebDir](#generalconfigbuildwebdir)
* [generalConfig/github/use](#generalconfiggithubuse)
* [generalConfig/github/username](#generalconfiggithubusername)
* [generalConfig/outputDir](#generalconfigoutputdir)
* [generalConfig/selectorPrefix](#generalconfigselectorprefix)
* [generalConfig/theme](#generalconfigtheme)
* [generalConfig/title](#generalconfigtitle)
* [generalConfig/useYarn](#generalconfiguseyarn)
* [packageJsonConfig/author](#packagejsonconfigauthor)
* [packageJsonConfig/contributors](#packagejsonconfigcontributors)
* [packageJsonConfig/description](#packagejsonconfigdescription)
* [packageJsonConfig/homepage](#packagejsonconfighomepage)
* [packageJsonConfig/name](#packagejsonconfigname)
* [packageJsonConfig/repository](#packagejsonconfigrepository)
* [routeConfig/default](#routeconfigdefault)
* [routeConfig/features/show](#routeconfigfeaturesshow)
* [routeConfig/login/activate](#routeconfigloginactivate)
* [routeConfig/login/name](#routeconfigloginname)
* [routeConfig/login/show](#routeconfigloginshow)
* [routeConfig/notFound/name](#routeconfignotfoundname)
* [routeConfig/notFound/redirect](#routeconfignotfoundredirect)
* [serverConfig/endpoint](#serverconfigendpoint)
* [serverConfig/management](#serverconfigmanagement)
* [serverConfig/packagePath](#serverconfigpackagepath)

### `generalConfig/buildWebDir`

Path to the target from the angular webapp for buildtime.
Hint: This folder will be created in the root of the project.
* default: `dist`
* type: `string`

### `generalConfig/github/use`

Defines whether the project is shared on github or not. With `true` dependencies will be displayed with by [david-dm.org](https://david-dm.org).
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `generalConfig/github/username`

If `generalConfig/github/use` is set to `true` you need to define a github username.
* default: EMPTY
* type: `string`

### `generalConfig/outputDir`

Path to the main directory without the name of the project itself.
* default: ` /path/to/workspace/`
* type: `string`

### `generalConfig/selectorPrefix`

A shortcut of the project, used in components like `hw-home` or `hw-app`.
* default: `hw`
* type: `string`

### `generalConfig/theme`

Name of a build-in theme from angular-material. This option ca be changed in the project by `config.json`.
* config-name: `theme`
* default: `indigo-pink`
* type: `string`
* values: `deeppurple-amber`/`indigo-pink`/`pink-bluegrey`/`purple-green`

### `generalConfig/title`

Applicationwide title of the app, displayed in title and toolbar. This option ca be changed in the project by `config.json`.
* config-name: `appname`
* default: `Hello world`
* type: `string`

### `generalConfig/useYarn`

Defines whatever yarn should be used or not. If this option is set to `false` npm will be used.
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `packageJsonConfig/author`

The name of the creator.
* default: `true`
* type: `string`

### `packageJsonConfig/contributors`

An array of contributers.
* default: EMPTY
* type: `array`

### `packageJsonConfig/description`

A description.
* default: EMPTY
* type: `string`

### `packageJsonConfig/homepage`

The website.
* default: EMPTY
* type: `string`

### `packageJsonConfig/name`

The name (foldername) of the project in the workspace. See `generalConfig/outputDir` to combinate.
* default: `helloWorld`
* type: `string`

### `packageJsonConfig/repository`

The repository. If `generalConfig/github/use` is activated, the repository will automatically generated.
* default: EMPTY
* type: `string`

### `routeConfig/default`

The main route and the redirect route after login if no route is stored. This option ca be changed in the project by `config.json`.
* config-name: `routes/default`
* default: `dashboard`
* type: `string`

### `routeConfig/features/show`

Defines whether feature routes will be displayed or not. This option ca be changed in the project by `config.json`.
* config-name: `routes/features/show`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `routeConfig/login/activate`

Defines whether a login will be used or not. This option ca be changed in the project by `config.json`.
* config-name: `routes/login/activate`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `routeConfig/login/name`

Defines the name of the login route.
* default: `login`
* type: `string`

### `routeConfig/login/show`

Defines whether login route will be displayed or not. This option ca be changed in the project by `config.json`.
* config-name: `routes/login/show`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `routeConfig/notFound/name`

The main route and the redirect route after login if no route is stored.
* default: `not-found`
* type: `string`

### `routeConfig/notFound/redirect`

Defines whether the 404 route will redirect to the default route or not. This option ca be changed in the project by `config.json`.
* config-name: `routes/notFound/redirect`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `serverConfig/endpoint`

Defines the endpoint of the app.
* default: `js`
* type: `string`
* values: `java`/`kotlin`/`js`/`php`

### `serverConfig/management`

Defines the management tool of the app.
* default: EMPTY
* type: `string`
* values: EMPTY/`maven`/`gradle`/

### `serverConfig/packagePath`

The package structure for java or kotlin.
* default: EMPTY
* type: `string`
