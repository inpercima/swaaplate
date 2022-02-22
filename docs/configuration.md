# Configuration

## Introduction

the following options refer to the `swaaplate.json` file named in the `Getting started` section in the root README.md file.

All options have to been set but some of them do not need to be changed.
Some of this options will be copied in the environment files of the new project and can be changed later.

## Table of contents

* [client/buildDir](#clientbuildDir)
* [client/ghUser](#clientghUser)
* [client/installDependencies](#clientinstallDependencies)
* [client/language](#clientlanguage)
* [client/modules/enabled](#clientmodulesenabled)
* [client/modules/features](#clientmodulesfeatures)
* [client/modules/features/defaultRoute](#clientmodulesfeaturesdefaultRoute)
* [client/modules/features/name](#clientmodulesfeaturesname)
* [client/modules/notFound](#clientmodulesnotfound)
* [client/modules/notFound/enabled](#clientmodulesnotfoundenabled)
* [client/modules/notFound/name](#clientmodulesnotfoundname)
* [client/modules/routing](#clientmodulesrouting)
* [client/packageJson/contributors](#clientpackageJsoncontributors)
* [client/packageJson/homepage](#clientpackageJsonhomepage)
* [client/packageJson/repository](#clientpackageJsonrepository)
* [client/prefix](#clientprefix)
* [client/theme](#clienttheme)
* [client/useGoogleFonts](#clientuseGoogleFonts)
* [client/useYarn](#clientuseyarn)
* [general/author](#generalauthor)
* [general/description](#generaldescription)
* [general/modRewriteIndex](#generalmodRewriteIndex)
* [general/name](#generalname)
* [general/title](#generaltitle)
* [general/useDocker](#generaluseDocker)
* [general/useMITLicense](#generaluseMITLicense)
* [general/useSecurity](#generaluseSecurity)
* [server/backend](#serverbackend)
* [server/javaKt](#serverjavaKt)
* [server/javaKt/management](#serverjavaKtmanagement)
* [server/javaKt/packagePath](#serverjavaKtpackagePath)
* [server/php](#serverphp)
* [server/php/modRewritePhpExtension](#serverphpmodRewritePhpExtension)
* [server/php/serverAsApi](#serverphpserverAsApi)

## `client/buildDir`

Defines the build dir for the webapp.

* default: `dist`
* type: `string`

## `client/ghUser`

Defines the username for github if this project is shared on github.

* default: EMPTY
* type: `string`

## `client/installDependencies`

Defines whether swaaplate should install tools and frontend dependencies or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `client/language`

Defines the language of the app client side.

* default: `en`
* type: `string`

## `client/modules/enabled`

Defines whether default modules for components should be created or not.
On `true` a features module will be created.
This can be used for components as pages like dashboard, contact, about or impress.
A not found module could be created, this depends on [client/modules/notFound/enabled](#clientmodulesnotfoundenabled).

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `client/modules/features`

This option depends on [client/modules/enabled](#clientmodulesenabled).

## `client/modules/features/defaultRoute`

The main route and the redirect route.
This option ca be changed in the environment files.

* environment name: `defaultRoute`
* default: `hello-world`
* type: `string`

## `client/modules/features/name`

Defines the name of the features module.

* default: `features`
* type: `string`

## `client/modules/notFound`

This option depends on [client/modules/enabled](#clientmodulesenabled) and [client/modules/routing](#clientmodulesrouting) too.

## `client/modules/notFound/enabled`

Defines whether the notFound module will be created and used or not.
On `true` a module and component will be created and used on routes are not existing.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `client/modules/notFound/name`

The name of the 404 module and component where to redirect if a route not exists.

* default: `not-found`
* type: `string`

## `client/modules/routing`

Defines whether a navigation will be created and routing could be used.
This option depends on [client/modules/enabled](#clientmodulesenabled).

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `client/packageJson/contributors`

An array of contributers.

* default: EMPTY
* type: `array`

## `client/packageJson/homepage`

The website. If this option is empty and `client/packageJson/repository` is set, this will be the same.

* default: EMPTY
* type: `string`

## `client/packageJson/repository`

The repository. If `client/ghUser` is set, the repository will be generated automatically.

* default: EMPTY
* type: `string`

## `client/prefix`

A shortcut of the project, used in components like `hw-home` or `hw-app`.

* default: `hw`
* type: `string`

## `client/theme`

Name of a build-in theme from angular-material.
This option ca be changed in the environment files.

* environment name: `theme`
* default: `indigo-pink`
* type: `string`
* values: `deeppurple-amber`/`indigo-pink`/`pink-bluegrey`/`purple-green`

## `client/useGoogleFonts`

Defines whatever Google Fonts should be used or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `client/useYarn`

Defines whatever yarn should be used or not.
If this option is set to `false` npm will be used.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `general/author`

The name of the creator.

* default: EMPTY
* type: `string`

## `general/description`

A description.

* default: EMPTY
* type: `string`

## `general/modRewriteIndex`

Defines whether the mode rewriting in Apache should be set up in a .htaccess file or not.

* default: `false`
* type: `boolean`
* values: `true`/`false`

## `general/name`

The name and foldername of the project in the workspace.

* default: `hello-world`
* type: `string`

## `general/title`

Applicationwide title of the app, displayed in title and toolbar.
This option can be changed in the environment files.

* environment name: `appname`
* default: `Hello world`
* type: `string`

## `general/useDocker`

Defines whether the project could be build within docker.
An empty Dockerfile and a docker-compose file will be created.

* default: `false`
* type: `boolean`
* values: `true`/`false`

## `general/useMITLicense`

Defines whether the project should be initialized with a MIT License.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `general/useSecurity`

Defines whether the project should be initialized with security and authentication options.
On `true` a login module and component and authentication services will be created.
For backends like `php` or `java` special components will be created too.

* default: `false`
* type: `boolean`
* values: `true`/`false`

## `server/backend`

Defines the backend of the app.

* default: `js`
* type: `string`
* values: `java`/`kt`/`js`/`php`

## `server/javaKt`

This option depends on [server/backend](#serverbackend) with `java` or `kt`.

## `server/javaKt/management`

Defines the management tool of the app.

* default: `maven`
* type: `string`
* values: `maven`/`gradle`/

## `server/javaKt/packagePath`

The package structure.

* default: EMPTY
* type: `string`

## `server/php`

This option depends on [server/backend](#serverbackend) with `php`.

## `server/php/modRewritePhpExtension`

Defines whether a .htaccess file should used or not.
This predefines no ending for php files.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `server/php/serverAsApi`

Defines that the server is used as a api reference or not.
The api URL in environment.ts and environment.prod.ts will be set to `./api/`.

* default: `true`
* type: `boolean`
* values: `true`/`false`
