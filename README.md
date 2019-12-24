# swaaplate

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)
[![devDependencies Status](https://david-dm.org/inpercima/swaaplate/dev-status.svg)](https://david-dm.org/inpercima/swaaplate?type=dev)

[s]imple [w]eb [a]pp [a]ngular tem[plate]. A very simple template generator for angular webapps with different backends.

Projects like [publicmedia](https://github.com/inpercima/publicmedia), [mittagstisch](https://github.com/inpercima/mittagstisch) or [run-and-fun](https://github.com/inpercima/run-and-fun) are build on it.

## Motivation

Creating a web application is a great thing but collecting everything you need is very annoying.
Therefore, I decided to write a small tool, which puts together all the necessary resources for the desired app from the given fundamentals and technologies.

## Benefits of swaaplate

### The goal

With swaaplate, the goal should be to create an angular web app with one of four backends, one of two management tools and one of two js dependency manager.
You can choose between `js`, `php`, `java` or `kotlin` as backend, `maven` or `gradle` as management tool and `npm` or `yarn` as js dependency manager.

As part of each backend, some features could be activated like creating a `htaccess` file or using `api` folder instead of `server` folder.

### Combinations

Currently the following combinations of backend, management tool and dependency manager are possible:

* `js` - `npm`
* `js` - `yarn`
* `php` - `npm`
* `php` - `yarn`
* `java (Spring-Boot)` - `maven` - `npm`
* `java (Spring-Boot)` - `maven` - `yarn`
* `java (Spring-Boot)` - `gradle` - `npm` in development
* `java (Spring-Boot)` - `gradle` - `yarn` in development
* `kotlin (Spring-Boot)` - `maven` - `npm`
* `kotlin (Spring-Boot)` - `maven` - `yarn`
* `kotlin (Spring-Boot)` - `gradle` - `npm` in development
* `kotlin (Spring-Boot)` - `gradle` - `yarn`  in development

### Features

#### General

* using docker

#### php

* using api folder as backend
* using a htaccess file

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

### Introduction

All options have to bet set but some of them do not need to be changed.
Some of this options will be copied in the environment files of the new project and can be changed later.

### Table of contents

* [general/author](#generalauthor)
* [general/description](#generaldescription)
* [general/github/use](#generalgithubuse)
* [general/github/username](#generalgithubusername)
* [general/name](#generalname)
* [general/title](#generaltitle)
* [general/useDocker](#generaluseDocker)
* [client/buildDir](#clientbuildDir)
* [client/installDependencies](#clientinstallDependencies)
* [client/packageJson/contributors](#clientpackageJsoncontributors)
* [client/packageJson/homepage](#clientpackageJsonhomepage)
* [client/packageJson/repository](#clientpackageJsonrepository)
* [client/route/features/default](#clientroutefeaturesdefault)
* [client/route/features/show](#clientroutefeaturesshow)
* [client/route/login/activate](#clientrouteloginactivate)
* [client/route/login/name](#clientrouteloginname)
* [client/route/login/show](#clientrouteloginshow)
* [client/route/notFound/name](#clientroutenotfoundname)
* [client/route/notFound/redirect](#clientroutenotfoundredirect)
* [client/selectorPrefix](#clientselectorprefix)
* [client/theme](#clienttheme)
* [client/useYarn](#clientuseyarn)
* [server/backend](#serverbackend)
* [server/htaccess](#serverhtaccess)
* [server/management](#servermanagement)
* [server/packagePath](#serverpackagepath)
* [server/serverAsApi](#serverserverasapi)

### `general/author`

The name of the creator.

* default: `true`
* type: `string`

### `general/description`

A description.

* default: EMPTY
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

### `general/name`

The name and foldername of the project in the workspace. See `Getting Started run section`.

* default: `helloWorld`
* type: `string`

### `general/title`

Applicationwide title of the app, displayed in title and toolbar.
This option ca be changed in the environment files.

* environment name: `appname`
* default: `Hello world`
* type: `string`

### `general/useDocker`

Defines whether the project could be build within docker.
An empty Dockerfile and a docker-compose file will be created.

* default: `false`
* type: `boolean`
* values: `true`/`false`

### `client/buildDir`

Defines the build dir for the webapp.

* default: `dist`
* type: `string`

### `client/installDependencies`

Defines whether swaaplate should install tools and frontend dependencies or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/packageJson/contributors`

An array of contributers.

* default: EMPTY
* type: `array`

### `client/packageJson/homepage`

The website. If this option is empty and `client/packageJson/repository` is set, this will be the same.

* default: EMPTY
* type: `string`

### `client/packageJson/repository`

The repository. If `general/github/use` is activated, the repository will be generated automatically.

* default: EMPTY
* type: `string`

### `client/route/features/default`

The main route and the redirect route after login if no route is stored.
This option ca be changed in the environment files.

* environment name: `defaultRoute`
* default: `dashboard`
* type: `string`

### `client/route/features/show`

Defines whether feature routes will be displayed or not.
This option ca be changed in the environment files.

* environment name: `showFeatures`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/route/login/activate`

Defines whether a login will be used or not.
This option ca be changed in the environment files.

* environment name: `activateLogin`
* default: `true`
* type: `boolean`
* values: `true`/`false`

### `client/route/login/name`

Defines the name of the login route.

* default: `login`
* type: `string`

### `client/route/login/show`

Defines whether login route will be displayed or not.
This option ca be changed in the environment files.

* environment name: `showLogin`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `client/route/notFound/name`

The main route and the redirect route after login if no route is stored.

* default: `not-found`
* type: `string`

### `client/route/notFound/redirect`

Defines whether the 404 route will redirect to the default route or not.
This option ca be changed in the environment files.

* environment name: `redirectNotFound`
* default: `false`
* type: `boolean`
* values: `true`/`false`

### `client/selectorPrefix`

A shortcut of the project, used in components like `hw-home` or `hw-app`.

* default: `hw`
* type: `string`

### `client/theme`

Name of a build-in theme from angular-material.
This option ca be changed in the environment files.

* environment name: `theme`
* default: `indigo-pink`
* type: `string`
* values: `deeppurple-amber`/`indigo-pink`/`pink-bluegrey`/`purple-green`

### `client/useYarn`

Defines whatever yarn should be used or not.
If this option is set to `false` npm will be used.

* default: `true`
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

## Changelog and migration

Check the [Changelog](./CHANGELOG.md) for updates and the [migration guide](./MIGRATIONGUIDE.md) for updating your project.
