{{PROJECT.READMEHEADER}}
This project was generated with [swaaplate](https://github.com/inpercima/swaaplate) version {{PROJECT.SWVERSION}}.

## Prerequisites

### Angular CLI

* `angular-cli 9.0.3` or higher{{PROJECT.PREREQUISITES}}

### Node, npm or yarn

* `node 12.16.0` or higher in combination with
  * `npm 6.13.4` or higher{{PROJECT.USENPM}} or
  * `yarn 1.22.0` or higher{{PROJECT.USEYARN}}

## Dependency check

Some libraries could not be updated b/c of peer dependencies or knowing issues.

| library    | current version | wanted version | reason |
| ---------- | --------------- | -------------- | ------ |{{PROJECT.DEPCHECK}}
| tslint     | 5.20.1          | 6.0.0          | "codelyzer@5.2.1" has incorrect peer dependency "tslint@^5.0.0" |

{{PROJECT.READMEGETTINGSTARTED}}
{{PROJECT.READMEIMPORT}}{{PROJECT.USAGE}}{{PROJECT.SERVER}}{{PROJECT.CLIENT}}{{PROJECT.DOCKER}}
