{{PROJECT.READMEHEADER}}{{PROJECT.READMEGETTINGSTARTED}}
Create environment files for `development mode`{{PROJECT.MOCKMODE}} and `production mode`.

```bash
cp src/environments/environment.ts src/environments/environment.dev.ts{{PROJECT.MOCKENV}}
cp src/environments/environment.ts src/environments/environment.prod.ts
```

**Note**: These files will not be under version control but listed in .gitignore.

## Usage

### Recommendation

It is recommanded to use a server to get full access of all angular.{{PROJECT.MOCKSERVER}}
For the other options your app should run on a server which you like.

### Run in development mode{{PROJECT.MOCKRUN}}

```bash
# build, reachable on http://localhost/app/path/to/dist/
{{PROJECT.USAGEYN}} build:dev{{PROJECT.MOCKBUILD}}

# build and starts a server, rebuild after changes, reachable on http://localhost:4200/
{{PROJECT.USAGEYN}} serve:dev{{PROJECT.MOCKSERVE}}

# build, rebuild after changes, reachable on http://localhost/app/path/to/dist/
{{PROJECT.USAGEYN}} watch:dev{{PROJECT.MOCKWATCH}}
```

### Package

```bash
# build in production mode, compressed
{{PROJECT.USAGEYN}} build:prod
```

### Tests

```bash
# test
ng test

# e2e
ng e2e
```

## Configuration

### General

All options have to been set in the environment files but some of them do not need to be changed.
All defaults refer to the environment file (`environment.ts`), they are prepared in `development mode` (`environment.dev.ts`).
Change for `production mode` the option `production` to `true`{{PROJECT.MOCKCONFIG}}.

### Table of contents

* [api](#api)
* [appname](#appname)
* [defaultRoute](#defaultroute)
* [production](#production)
* [theme](#theme)

### `api`

Defines the URL to the backend.

* default: `{{PROJECT.API}}`
* type: `string`

### `appname`

Applicationwide title of the app, displayed in title and toolbar.

* default: `{{PROJECT.TITLE}}`
* type: `string`

### `defaultRoute`

The default route and the route to be redirected after a login if no route is stored or if a route does not exist.

* default: `{{PROJECT.DEFAULTROUTE}}`
* type: `string`

### `production`

Defines whether the app is in production or not.

* default: `false`
* type: `boolean`
* values: `true`/`false`

### `theme`

Name of a build-in theme from angular-material or a custom light or dark theme.

* default: `{{PROJECT.THEME}}`
* type: `string`
* values: `deeppurple-amber`/`indigo-pink`/`pink-bluegrey`/`purple-green`/`custom-light`/`custom-dark`

To create a custom light or dark theme just edit the colors and themes in `themes.scss`.
