# swaaplate

[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)

[s]imple [w]eb [a]pp [a]ngular tem[plate]. A very simple template generator for angular webapps with different backends.

Projects like [publicmedia](https://github.com/inpercima/publicmedia), [cryptocheck](https://github.com/inpercima/cryptocheck), [mittagstisch](https://github.com/inpercima/mittagstisch) or [run-and-fun](https://github.com/inpercima/run-and-fun) are build on it.

## Motivation

Creating a web application is a great thing but collecting everything you need is very annoying.
Therefore, I decided to write a small tool, which puts together all the necessary resources for the desired app from the given fundamentals and technologies.

## Benefits of swaaplate

### The goal

With swaaplate, the goal should be to create an angular web app with one of four backends, one of two management tools and one of two js dependency manager.
You can choose between `none` (means angular only), `nestjs`, `php`, `java` or `kt` as backend, `maven` or `gradle` as management tool and `npm` or `yarn` as js dependency manager.

## Prerequisites

### Angular CLI

* `@angular/cli 17.0.8` or higher

### Nestjs CLI (if backend `nestjs` is used)

* `@nestjs/cli 10.2.1` or higher

### Node, npm or yarn

* `node 20.9.0` or higher in combination with
  * `npm 10.1.0` or higher or
  * `yarn 1.22.19` or higher, used in this repository

## Getting started

```bash
# clone project
git clone https://github.com/inpercima/swaaplate
cd swaaplate

# copy src/template/swaaplate.default.json to swaaplate.json
cp src/template/swaaplate.default.json swaaplate.json

# install tools
yarn

# change data in swaaplate.json (see ./docs/configuration.md) and run swaaplate with one argument for the workspace path
./swaaplate.js /absolute/path/to/workspace
```

## Documentation

You can find all the documentation under [./docs](./docs/index.md).

## Changelog

Check the [Changelog](./CHANGELOG.md) for updates.
