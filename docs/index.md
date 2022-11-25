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

An update only updates the frontend dependencies.
No migration is carried out.

### How to enable the mock in a project

See [Enable the mock in a project](./config.mock.md).

### How to enable the routing in a project

See [Enable the routing in a project](./config.routing.md).
