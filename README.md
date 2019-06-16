# swaaplate

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)
[![devDependencies Status](https://david-dm.org/inpercima/swaaplate/dev-status.svg)](https://david-dm.org/inpercima/swaaplate?type=dev)

[s]imple [w]eb [a]pp [a]ngular tem[plate] generator. A simple generator of a web app based on angular.

Projects like [publicmedia](https://github.com/inpercima/publicmedia), [mittagstisch](https://github.com/inpercima/mittagstisch) or [run-and-fun-2](https://github.com/inpercima/run-and-fun-2) are build on it.

## Motivation

Creating a web application is a great thing but collecting everything you need is very annoying.
Therefore, I decided to write a small tool, which puts together all the necessary resources for the desired app from the given fundamentals and technologies.

## Benefits of swaaplate

With swaaplate, the goal should be to create an angular web app with one of four backends, one of two management tools and one of two js dependency manager.
You can choose between `js`, `php`, `java` or `kotlin` as backend, `maven` or `gradle` as management tool and `npm` or `yarn` as js dependency manager.

Currently the following combinations are possible.

* `angular` - `js` - `npm`
* `angular` - `js` - `yarn`
* `angular` - `php` - `npm`
* `angular` - `php` - `yarn`
* `angular` - `java (Spring-Boot)` - `npm`
* `angular` - `java (Spring-Boot)` - `yarn`
* `angular` - `java (Spring-Boot)` - `maven` - `npm`
* `angular` - `java (Spring-Boot)` - `maven` - `yarn`
* `angular` - `java (Spring-Boot)` - `gradle` - `npm` in development
* `angular` - `java (Spring-Boot)` - `gradle` - `yarn` in development
* `angular` - `kotlin (Spring-Boot)` - `npm`
* `angular` - `kotlin (Spring-Boot)` - `yarn`
* `angular` - `kotlin (Spring-Boot)` - `maven` - `npm`
* `angular` - `kotlin (Spring-Boot)` - `maven` - `yarn`
* `angular` - `kotlin (Spring-Boot)` - `gradle` - `npm` in development
* `angular` - `kotlin (Spring-Boot)` - `gradle` - `yarn`  in development

## Prerequisites

### Node, npm or yarn

* `node 12.3.1` or higher in combination with
  * `npm 6.9.0` or higher or
  * `yarn 1.16.0` or higher, used in this repository

## Getting started

```bash
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
Some of this options will be copied in the environment files of the new project and can be changed later.

### Table of contents

* [generalConfig/buildWebDir](#generalconfigbuildwebdir)
* [generalConfig/github/use](#generalconfiggithubuse)
* [generalConfig/github/username](#generalconfiggithubusername)
* [generalConfig/installDependencies](#generalconfiginstallDependencies)
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
* [serverConfig/htaccess](#serverconfightaccess)
* [serverConfig/management](#serverconfigmanagement)
* [serverConfig/packagePath](#serverconfigpackagepath)
* [serverConfig/separateReadme](#serverconfigseparatereadme)
* [serverConfig/serverAsApi](#serverconfigserverasapi)

### `generalConfig/buildWebDir`

Path to the target from the angular webapp for buildtime.

* default: `dist`
* type: `string`

### `generalConfig/github/use`

Defines whether the project is shared on github or not.
With `true` dependencies will be displayed with by [david-dm.org](https://david-dm.org).

* default: `false`
* type: `boolean`
* values: `true`/`false`

### `generalConfig/github/username`

If `generalConfig/github/use` is set to `true` you need to define a github username.

* default: EMPTY
* type: `string`

### `generalConfig/installDependencies`

Defines whether swaaplate should install tools and frontend dependencies or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `generalConfig/outputDir`

Path to the main directory without the name of the project itself.

* default: `/path/to/workspace/`
* type: `string`

### `generalConfig/selectorPrefix`

A shortcut of the project, used in components like `hw-home` or `hw-app`.

* default: `hw`
* type: `string`

### `generalConfig/theme`

Name of a build-in theme from angular-material.
This option ca be changed in the environment files.

* environment name: `theme`
* default: `indigo-pink`
* type: `string`
* values: `deeppurple-amber`/`indigo-pink`/`pink-bluegrey`/`purple-green`

### `generalConfig/title`

Applicationwide title of the app, displayed in title and toolbar.
This option ca be changed in the environment files.

* environment name: `appname`
* default: `Hello world`
* type: `string`

### `generalConfig/useYarn`

Defines whatever yarn should be used or not.
If this option is set to `false` npm will be used.

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

The website. If this option is empty and `packageJsonConfig/repository` is set, this will be the same.

* default: EMPTY
* type: `string`

### `packageJsonConfig/name`

The name (foldername) of the project in the workspace. See `generalConfig/outputDir` to combinate.

* default: `helloWorld`
* type: `string`

### `packageJsonConfig/repository`

The repository. If `generalConfig/github/use` is activated, the repository will be generated automatically.

* default: EMPTY
* type: `string`

### `routeConfig/default`

The main route and the redirect route after login if no route is stored.
This option ca be changed in the environment files.

* environment name: `defaultRoute`
* default: `dashboard`
* type: `string`

### `routeConfig/features/show`

Defines whether feature routes will be displayed or not.
This option ca be changed in the environment files.

* environment name: `showFeatures`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `routeConfig/login/activate`

Defines whether a login will be used or not.
This option ca be changed in the environment files.

* environment name: `activateLogin`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `routeConfig/login/name`

Defines the name of the login route.

* default: `login`
* type: `string`

### `routeConfig/login/show`

Defines whether login route will be displayed or not.
This option ca be changed in the environment files.

* environment name: `showLogin`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `routeConfig/notFound/name`

The main route and the redirect route after login if no route is stored.

* default: `not-found`
* type: `string`

### `routeConfig/notFound/redirect`

Defines whether the 404 route will redirect to the default route or not.
This option ca be changed in the environment files.

* environment name: `redirectNotFound`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `serverConfig/endpoint`

Defines the endpoint of the app.

* default: `js`
* type: `string`
* values: `java`/`kotlin`/`js`/`php`

### `serverConfig/htaccess`

Defines whether a .htaccess file should used or not.
This predefines no ending for php files.
This will work for php only.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `serverConfig/management`

Defines the management tool of the app.
This will work for java or kotlin only.

* default: EMPTY
* type: `string`
* values: EMPTY/`maven`/`gradle`/

### `serverConfig/packagePath`

The package structure.
This will work for java or kotlin only.

* default: EMPTY
* type: `string`

### `serverConfig/separateReadme`

Defines whether a separate readme for client and server/api folders should created or not.
This will work for java and kotlin only.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `serverConfig/serverAsApi`

Defines that the server is used as a api reference or not.
The api URL in environment.ts and environment.prod.ts will be set to `./api/`.
This will work for php only.

* default: `true`
* type: `boolean`
* values: `true`/`false`
