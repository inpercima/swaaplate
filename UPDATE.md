# How to update a project

## version 0.2.0 to version 0.3.0

Befor using swaaplate to update a project, you have to do following steps:

* if you use an endpoint unlike js and your server part is api
  * copy project/src/main to project/api/src/main
* if you use an endpoint unlike js and your server part is server
  * copy project/src/main to project/server/src/main
* rename project/src to project/client
* remove project/src/main
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
* delete everything except for .git-folder
* run swaaplate with you backup data
* manage your changes via git
