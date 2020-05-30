# Documentation

All notable information to this project will be documented in this linked files.

## Table of contents

* [configuration](#configuration)
* [migration](#migration)
* [FAQ](#faq)

## Configuration

See [configuration](./configuration.md).

## Migration

See [migration](./migration.md).

## FAQ

### How to update an project

Remember, to create an project you use the following command:

```bash
./swaaplate.js /absolute/path/to/workspace
```

To update an existing project you have to use the known command with parameter `-u` for update.
In this way the `swaaplate.json` file from your project will be used.

```bash
./swaaplate.js -u /absolute/path/to/project
```

### What does an update do

An update only updates the client dependencies.
No migration is carried out.

### How to enabble the mock in a project

To mock data [json-server](https://github.com/typicode/json-server) is used.

Several changes are required to activate the mock.
Check the commit [Activate mock](https://github.com/inpercima/swaaplate-hw/commit/47b1c425ad62a1ecbe4c1171d42231eed518f490) in the sample project to see the changes.

Summary:

* create `environment.mock.ts` file under environment folder
* create `db.json` file under new new mock folder
* create `middleware.js` file under new mock folder
* update `angular.json` file
* update `package.json` file
* update `swaaplate.json` file
* update your README

If you use php, the existing `webpack.config.js` file needs also to be changed.

From:

```js
...
    new CopyWebpackPlugin([{
      from: '../server/src/main',
      to: './server',
    }])
...
```

To:

```js
...
    process.env.NODE_ENV !== 'mock' ?
      new CopyWebpackPlugin([{
        from: '../server/src/main',
        to: './server',
      }]) : {}
...
```

