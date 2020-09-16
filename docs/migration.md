# Migration

All necessary changes that have to be made if projects are to be changed.

## 1.1.1 to 2.0.0

* update the projects `swaaplate.json` file described in [Changelog 2.0.0](../CHANGELOG.md#200)

## 1.1.0 to 1.1.1

* :tada: nothing todo

## 1.0.1 to 1.1.0

* update the projects `swaaplate.json` file described in [Changelog 1.1.0](../CHANGELOG.md#110)
* add the package manager to your `angular.json` on root like this:

```json
"cli": {
  "packageManager": "yarn"
},
```

## 1.0.0 to 1.0.1

* update the projects angular component html files like this:

From:

```html
<div fxLayout="row">
  <div fxFlex="20%"></div>
  <div fxFlex>
    ...
  </div>
  <div fxFlex="20%"></div>
</div>
```

To:

```html
<div fxLayout="row" fxLayoutAlign="center">
  <div fxFlex="60">
    ...
  </div>
</div>
```
