# About this - swaaplate
[s]imple [w]eb [a]pp [a]ngular tem[plate]. A very simple own template for webapps.

Projects like [publicmedia](https://github.com/inpercima/publicmedia) or [run-and-fun-2](https://github.com/inpercima/run-and-fun-2) are build on it.

# Prerequisites
## Node, npm or yarn
* `node 8.10.0` or higher in combination with
  * `npm 5.7.1` or higher or
  * `yarn 1.5.1` or higher, used in this repository

# Getting started

```
# clone project
git clone https://github.com/inpercima/swaaplate
cd swaaplate
```

# Usage

```
# copy swaaplate.default.json to swaaplate.json
cp swaaplate.default.json swaaplate.json

# install dependencies
yarn
# or
npm install

# change data in swaaplate.json (more info see below) and run swaaplate
node swaaplate.js
```

# Configuration
## General
The configuration for swaaplate is devided in two main parts: `projectData` and `workData`.
The section projectData includes all things for the project while workData includes all things for creationtime.

## ProjectData
The options in `config` will be copied in `config.json` and can be changed later.

| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| author | String | EMPTY | the name of the creator of the project |
| buildDir | String | /build | path to the exports from angular for buildtime |
| config/activateLogin | Boolean | true | define that a login page should be used (`true`/`false`) |
| config/routes/defaultRoute | String | home | the default route after login if no route is stored |
| config/routes/showFeatures | Boolean | true | define that the feature routes should be displayed in the navigation (`true`/`false`) |
| config/routes/showLogin | Boolean | false | define that the login route should be displayed in the navigation (`true`/`false`), works in combination with `activateLogin`, the login route will be displayed only if both options set to `true` |
| config/theme | String | indigo-pink | name of a build-in theme from angular-material, one of `deeppurple-amber`, `indigo-pink`, `pink-bluegrey`, `purple-green` |
| selectorPrefix | String | hw | a shortcut of the project, used in components like `hw-home` or `hw-app` |
| contributorName | String | EMPTY | the name of the first cntributor |
| contributorEmail | String | EMPTY | the e-mail-address of the first cntributor |
| description | String | hello world | the name of the creator of the project |
| github/useAccount | Boolean | false | for sharing the project on github you can define it (`true`/`false`), will be used in `package.json` |
| github/username | String | EMPTY | the username of the github account |
| homepage | String | EMPTY | the website of the project |
| name | String | helloWorld | the projectname, this will be copied in `config.json` as `appname` |
| repository | String | EMPTY | the repository of the project |
| serverComponent/authenticateUrl | String | EMPTY | if one of the server component will be used, this address will be used for authentication |
| serverComponent/useSimpleServer | Boolean | false | define that a simple server component should be used (`true`/`false`) |
| serverComponent/springBoot/use | Boolean | false | define that spring-boot should be used (`true`/`false`) |
| serverComponent/springBoot/packagePath | String | EMPTY | the package structure |

## WorkData
| Name | Type | Default | Description |
| ---- | ---- | ------- | ----------- |
| outputDir | String | /path/to/workspace/ | path to the main directory of the project |
