# About PROJECTDATA_NAME
[![MIT license](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE.md)
PROJECTDATA_DESCRIPTION

This project was generated with [swaaplate](https://github.com/inpercima/swaaplate).

# Necessary tools
* node 6.9.x or higher

# Optionally tools
* npm 5.3 or higher
* yarn 1.0.1 or higher

# Recommended tools
* [TypeScript IDE](https://marketplace.eclipse.org/content/typescript-ide) plugin for eclipse

# Usage

```
git clone PROJECTDATA_CLONEURL
cd PROJECTDATA_NAME

# copy config.default.json to config.json
cp config/config.default.json config/config.json

# install tools and frontend dependencies via npm or yarn
# npm
npm install

# yarn
yarn

# build resources in devMode with devServer
npm/yarn run build:server
http://localhost:8080/

# build resources in devMode without devSever
npm/yarn run build:dev

# build resources in devMode without devSever, watch changes and rebuild
npm/yarn run build:watch

# build resources in prodMode
npm/yarn run build:prod
```

# Config
Under config/config.json some application configuration could be set.

* `appname` applicationwide title of the app, displayed in title and toolbar
* `theme` name of a build-in theme from angular-material, one of
  * deeppurple-amber
  * indigo-pink
  * pink-bluegrey
  * purple-green
* `activateLogin` use **true** if a login page should be used, otherwise **false**
* `showLogin` use **true** if the login route should be displayed in the navigation, otherwise **false**, this option is in combination
with `activateLogin`, the login route will be displayed only if both options set to **true**
* `showFeatures` use **true** if the feature routes should be displayed in the navigation, otherwise **false**
* `defaultRoute` the default route after login if no route is stored
