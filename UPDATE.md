# How to update a project

## version 0.2.0 to version 0.3.0

Before using swaaplate to update a project, you have to do following steps:

* if you use an endpoint unlike js and your server part is api
  * move project/src/main to project/api/src/main
* if you use an endpoint unlike js and your server part is server
  * move project/src/main to project/server/src/main
* rename project/src to project/client
* move following files from project/ to project/client
  * e2e/
  * mock/
  * angular.json
  * package.json
  * tsconfig.json
  * tslint.json
  * webpack.config.js
  * yarn.lock
* rename project/client/web to project/client/src
* remove project/node_modules
* save changes as new commit to git
* remove everything except for the folder .git in project
* run swaaplate with your backup data
* manage your changes via git
