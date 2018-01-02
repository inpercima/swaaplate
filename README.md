# About swaaplate
The name `swaaplate` stands for `simple web app angular template`.

A very simple own template on which for example [publicmedia](https://github.com/inpercima/publicmedia) or 
[run-and-fun-2](https://github.com/inpercima/run-and-fun-2) are build on.

# Necessary tools
* node 6.9.x or higher

# Optionally tools
* npm 5.3 or higher
* yarn 1.0.1 or higher

# Usage

```
# clone project
git clone https://github.com/inpercima/swaaplate
cd swaaplate

# install tools manually via npm or yarn
# npm
npm install

# yarn
yarn

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
| config/routes/activateLogin | Boolean | true | define that a login page should be used (`true`/`false`) |
| config/routes/defaultRoute | String | home | the default route after login if no route is stored |
| config/routes/showFeatures | Boolean | true | define that the feature routes should be displayed in the navigation (`true`/`false`) |
| config/routes/showLogin | Boolean | false | define that the login route should be displayed in the navigation (`true`/`false`), works in combination with `activateLogin`, the login route will be displayed only if both options set to `true` |
| config/theme | String | indigo-pink | name of a build-in theme from angular-material, one of `deeppurple-amber`, `indigo-pink`, `pink-bluegrey`, `purple-green` |
| componentShort | String | hw | a shortcut of the project, used in components like `hw-home` or `hw-app` |
| contributorName | String | EMPTY | the name of the first cntributor |
| contributorEmail | String | EMPTY | the e-mail-address of the first cntributor |
| description | String | hello world | the name of the creator of the project |
| github/useAccount | Boolean | false | for sharing the project on github you can define it (`true`/`false`), will be used in `package.json` |
| github/username | String | EMPTY | the username of the github account |
| homepage | String | EMPTY | the website of the project |
| name | String | helloWorld | the projectname, this will be copied in `config.json` as `appname` |
| repository | String | EMPTY | the repository of the project |
| serverComponent/ | String | EMPTY | the username of the github account |
| serverComponent/authenticateUrl | String | EMPTY | if one of the server component will be used, this address will be used for authentication |
| serverComponent/useSimpleServer | Boolean | false | define that a simple server component should be used (`true`/`false`) |
| serverComponent/useSpringBoot | Boolean | false | define that spring-boot should be used (`true`/`false`) |
