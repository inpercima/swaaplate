# Enable the mock in a project

## General

To mock data [json-server](https://github.com/typicode/json-server) is used.

Check out the commit [Activate mock](https://github.com/inpercima/swaaplate-hw/commit/47b1c425ad62a1ecbe4c1171d42231eed518f490) in the sample project to see the changes.
Not existing files `environment.mock.ts`, `db.json` and `middleware.js` needs to be created.

## PHP

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
