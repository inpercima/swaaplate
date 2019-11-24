# swaaplate

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)
[![devDependencies Status](https://david-dm.org/inpercima/swaaplate/dev-status.svg)](https://david-dm.org/inpercima/swaaplate?type=dev)

[s]imple [w]eb [a]pp [a]ngular tem[plate]. A very simple template generator for angular webapps with different backends.

Projects like [publicmedia](https://github.com/inpercima/publicmedia), [mittagstisch](https://github.com/inpercima/mittagstisch) or [run-and-fun](https://github.com/inpercima/run-and-fun) are build on it.

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
* `angular` - `php` - `npm` with api folder
* `angular` - `php` - `npm` with htaccess file
* `angular` - `php` - `npm` with api folder and htaccess file
* `angular` - `php` - `yarn`
* `angular` - `php` - `yarn` with api folder
* `angular` - `php` - `yarn` with htaccess file
* `angular` - `php` - `yarn` with api folder and htaccess file
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
  * `npm 6.12.1` or higher or
  * `yarn 1.19.1` or higher, used in this repository

## Getting started

```bash
# clone project
git clone https://github.com/inpercima/swaaplate
cd swaaplate

# copy src/template/swaaplate.default.json to swaaplate.json
cp src/template/swaaplate.default.json swaaplate.json

# install tools
yarn

# change data in swaaplate.json (more info in configuration) and run swaaplate with one argument for the workspace path
./swaaplate.js /absolute/path/to/workspace
```

## Configuration

### General

All options have to bet set but some of them do not need to be changed.
Some of this options will be copied in the environment files of the new project and can be changed later.

### Table of contents

* [general/buildWebDir](#generalbuildwebdir)
* [general/github/use](#generalgithubuse)
* [general/github/username](#generalgithubusername)
* [general/installDependencies](#generalinstallDependencies)
* [general/selectorPrefix](#generalselectorprefix)
* [general/theme](#generaltheme)
* [general/title](#generaltitle)
* [general/useYarn](#generaluseyarn)
* [packageJson/author](#packageJsonauthor)
* [packageJson/contributors](#packageJsoncontributors)
* [packageJson/description](#packageJsondescription)
* [packageJson/homepage](#packageJsonhomepage)
* [packageJson/name](#packageJsonname)
* [packageJson/repository](#packageJsonrepository)
* [route/default](#routedefault)
* [route/features/show](#routefeaturesshow)
* [route/login/activate](#routeloginactivate)
* [route/login/name](#routeloginname)
* [route/login/show](#routeloginshow)
* [route/notFound/name](#routenotfoundname)
* [route/notFound/redirect](#routenotfoundredirect)
* [server/backend](#serverbackend)
* [server/htaccess](#serverhtaccess)
* [server/management](#servermanagement)
* [server/packagePath](#serverpackagepath)
* [server/serverAsApi](#serverserverasapi)

### `general/buildWebDir`

Path to the target from the angular webapp for buildtime.

* default: `dist`
* type: `string`

### `general/github/use`

Defines whether the project is shared on github or not.
With `true` dependencies will be displayed with by [david-dm.org](https://david-dm.org).

* default: `false`
* type: `boolean`
* values: `true`/`false`

### `general/github/username`

If `general/github/use` is set to `true` you need to define a github username.

* default: EMPTY
* type: `string`

### `general/installDependencies`

Defines whether swaaplate should install tools and frontend dependencies or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `general/selectorPrefix`

A shortcut of the project, used in components like `hw-home` or `hw-app`.

* default: `hw`
* type: `string`

### `general/theme`

Name of a build-in theme from angular-material.
This option ca be changed in the environment files.

* environment name: `theme`
* default: `indigo-pink`
* type: `string`
* values: `deeppurple-amber`/`indigo-pink`/`pink-bluegrey`/`purple-green`

### `general/title`

Applicationwide title of the app, displayed in title and toolbar.
This option ca be changed in the environment files.

* environment name: `appname`
* default: `Hello world`
* type: `string`

### `general/useYarn`

Defines whatever yarn should be used or not.
If this option is set to `false` npm will be used.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `packageJson/author`

The name of the creator.

* default: `true`
* type: `string`

### `packageJson/contributors`

An array of contributers.

* default: EMPTY
* type: `array`

### `packageJson/description`

A description.

* default: EMPTY
* type: `string`

### `packageJson/homepage`

The website. If this option is empty and `packageJson/repository` is set, this will be the same.

* default: EMPTY
* type: `string`

### `packageJson/name`

The name and foldername of the project in the workspace. See `Getting Started run section`.

* default: `helloWorld`
* type: `string`

### `packageJson/repository`

The repository. If `general/github/use` is activated, the repository will be generated automatically.

* default: EMPTY
* type: `string`

### `route/default`

The main route and the redirect route after login if no route is stored.
This option ca be changed in the environment files.

* environment name: `defaultRoute`
* default: `dashboard`
* type: `string`

### `route/features/show`

Defines whether feature routes will be displayed or not.
This option ca be changed in the environment files.

* environment name: `showFeatures`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `route/login/activate`

Defines whether a login will be used or not.
This option ca be changed in the environment files.

* environment name: `activateLogin`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `route/login/name`

Defines the name of the login route.

* default: `login`
* type: `string`

### `route/login/show`

Defines whether login route will be displayed or not.
This option ca be changed in the environment files.

* environment name: `showLogin`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `route/notFound/name`

The main route and the redirect route after login if no route is stored.

* default: `not-found`
* type: `string`

### `route/notFound/redirect`

Defines whether the 404 route will redirect to the default route or not.
This option ca be changed in the environment files.

* environment name: `redirectNotFound`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `server/backend`

Defines the backend of the app.

* default: `js`
* type: `string`
* values: `java`/`kotlin`/`js`/`php`

### `server/htaccess`

Defines whether a .htaccess file should used or not.
This predefines no ending for php files.
This will work for php only.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `server/management`

Defines the management tool of the app.
This will work for java or kotlin only.

* default: EMPTY
* type: `string`
* values: EMPTY/`maven`/`gradle`/

### `server/packagePath`

The package structure.
This will work for java or kotlin only.

* default: EMPTY
* type: `string`

### `server/serverAsApi`

Defines that the server is used as a api reference or not.
The api URL in environment.ts and environment.prod.ts will be set to `./api/`.
This will work for php only.

* default: `true`
* type: `boolean`
* values: `true`/`false`
