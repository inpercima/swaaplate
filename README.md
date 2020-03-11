# swaaplate

## Attention

This project is currently under high construction!

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)
[![devDependencies Status](https://david-dm.org/inpercima/swaaplate/dev-status.svg)](https://david-dm.org/inpercima/swaaplate?type=dev)

[s]imple [w]eb [a]pp [a]ngular tem[plate]. A very simple template generator for angular webapps with different backends.

Projects like [publicmedia](https://github.com/inpercima/publicmedia), [cryptocheck](https://github.com/inpercima/cryptocheck), [mittagstisch](https://github.com/inpercima/mittagstisch) or [run-and-fun](https://github.com/inpercima/run-and-fun) are build on it.

## Motivation

Creating a web application is a great thing but collecting everything you need is very annoying.
Therefore, I decided to write a small tool, which puts together all the necessary resources for the desired app from the given fundamentals and technologies.

## Benefits of swaaplate

### The goal

With swaaplate, the goal should be to create an angular web app with one of four backends, one of two management tools and one of two js dependency manager.
You can choose between `js` (means angular only), `php`, `java` or `kt` as backend, `maven` or `gradle` as management tool and `npm` or `yarn` as js dependency manager.

## Prerequisites

### Angular cli

* `angular-cli 9.0.5` or higher

### Node, npm or yarn

* `node 12.16.1` or higher in combination with
  * `npm 6.13.4` or higher or
  * `yarn 1.22.0` or higher, used in this repository

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

# to update a project use following syntax, the swaaplate.json file from your project will be used
./swaaplate.js -u /absolute/path/to/project
```

## Configuration

### Introduction

All options have to been set but some of them do not need to be changed.
Some of this options will be copied in the environment files of the new project and can be changed later.

### Table of contents

* [client/buildDir](#clientbuildDir)
* [client/ghUser](#clientghUser)
* [client/installDependencies](#clientinstallDependencies)
* [client/language](#clientlanguage)
* [client/packageJson/contributors](#clientpackageJsoncontributors)
* [client/packageJson/homepage](#clientpackageJsonhomepage)
* [client/packageJson/repository](#clientpackageJsonrepository)
* [client/prefix](#clientprefix)
* [client/routing/enabled](#clientroutingenabled)
* [client/routing/features/default](#clientroutingfeaturesdefault)
* [client/routing/features/name](#clientroutingfeaturesname)
* [client/routing/features/show](#clientroutingfeaturesshow)
* [client/routing/login/activate](#clientroutingloginactivate)
* [client/routing/login/enabled](#clientroutingloginenabled)
* [client/routing/login/name](#clientroutingloginname)
* [client/routing/login/show](#clientroutingloginshow)
* [client/routing/notFound/enabled](#clientroutingnotFoundenabled)
* [client/routing/notFound/name](#clientroutingnotfoundname)
* [client/routing/notFound/redirect](#clientroutingnotfoundredirect)
* [client/theme](#clienttheme)
* [client/useGoogleFonts](#clientuseGoogleFonts)
* [client/useYarn](#clientuseyarn)
* [general/author](#generalauthor)
* [general/description](#generaldescription)
* [general/name](#generalname)
* [general/title](#generaltitle)
* [general/useDocker](#generaluseDocker)
* [general/useMITLicense](#generaluseMITLicense)
* [server/backend](#serverbackend)
* [server/htaccess](#serverhtaccess)
* [server/management](#servermanagement)
* [server/packagePath](#serverpackagepath)
* [server/serverAsApi](#serverserverasapi)

### `client/buildDir`

Defines the build dir for the webapp.

* default: `dist`
* type: `string`

### `client/ghUser`

Defines username for github if this project is shared on github.
If the value is not EMPTY dependencies will be displayed with by [david-dm.org](https://david-dm.org).

* default: EMPTY
* type: `string`

### `client/installDependencies`

Defines whether swaaplate should install tools and frontend dependencies or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/language`

Defines language of the app client side.

* default: `en`
* type: `string`

### `client/packageJson/contributors`

An array of contributers.

* default: EMPTY
* type: `array`

### `client/packageJson/homepage`

The website. If this option is empty and `client/packageJson/repository` is set, this will be the same.

* default: EMPTY
* type: `string`

### `client/packageJson/repository`

The repository. If `client/ghUser` is set, the repository will be generated automatically.

* default: EMPTY
* type: `string`

### `client/prefix`

A shortcut of the project, used in components like `hw-home` or `hw-app`.

* default: `hw`
* type: `string`

### `client/routing/enabled`

Defines whether routes will used or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/routing/features/default`

The main route and the redirect route after log in if no route is stored.
This option ca be changed in the environment files.
This depends on `client/routing/enabled`.

* environment name: `defaultRoute`
* default: `dashboard`
* type: `string`

### `client/routing/features/name`

Defines the name of the features module.
This depends on `client/routing/enabled`.

* default: `features`
* type: `string`

### `client/routing/features/show`

Defines whether feature routes will be displayed or not.
This option ca be changed in the environment files.
This depends on `client/routing/enabled`.

* environment name: `showFeatures`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/routing/login/activate`

Defines whether a login will be activated or not.
This option can be changed in the environment files.
This depends on `client/routing/login/enabled`.

* environment name: `activateLogin`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/routing/login/enabled`

Defines whether a login will be used or not.
This depends on `client/routing/enabled`.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/routing/login/name`

Defines the name of the login route.
This depends on `client/routing/login/enabled`.

* default: `login`
* type: `string`

### `client/routing/login/show`

Defines whether login route will be displayed or not.
This option ca be changed in the environment files.
This depends on `client/routing/login/enabled`.

* environment name: `showLogin`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `client/routing/notFound/enabled`

Defines whether notFound route will be used or not.
This depends on `client/routing/enabled`.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/routing/notFound/name`

The name of the 404 route where to redirect if a route not exists.
This depends on `client/routing/notFound/enabled`.

* default: `not-found`
* type: `string`

### `client/routing/notFound/redirect`

Defines whether the 404 route will redirect to the default route or not.
This option ca be changed in the environment files.
This depends on `client/routing/notFound/enabled`.

* environment name: `redirectNotFound`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `client/theme`

Name of a build-in theme from angular-material.
This option ca be changed in the environment files.

* environment name: `theme`
* default: `indigo-pink`
* type: `string`
* values: `deeppurple-amber`/`indigo-pink`/`pink-bluegrey`/`purple-green`

### `client/useGoogleFonts`

Defines whatever Google Fonts should be used or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/useYarn`

Defines whatever yarn should be used or not.
If this option is set to `false` npm will be used.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `general/author`

The name of the creator.

* default: EMPTY
* type: `string`

### `general/description`

A description.

* default: EMPTY
* type: `string`

### `general/name`

The name and foldername of the project in the workspace.

* default: `hello-world`
* type: `string`

### `general/title`

Applicationwide title of the app, displayed in title and toolbar.
This option can be changed in the environment files.

* environment name: `appname`
* default: `Hello world`
* type: `string`

### `general/useDocker`

Defines whether the project could be build within docker.
An empty Dockerfile and a docker-compose file will be created.

* default: `false`
* type: `boolean`
* values: `true`/`false`

### `general/useMITLicense`

Defines whether the project should be initialized with a MIT License.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `server/backend`

Defines the backend of the app.

* default: `js`
* type: `string`
* values: `java`/`kt`/`js`/`php`

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

## Changelog and migration

Check the [Changelog](./CHANGELOG.md) for updates and the [migration guide](./MIGRATIONGUIDE.md) for updating your project.
