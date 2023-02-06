# Configuration

## Introduction

the following options refer to the `swaaplate.json` file named in the `Getting started` section in the root README.md file.

All options have to been set but some of them do not need to be changed.
Some of this options will be copied in the environment files of the new project and can be changed later.

## Table of contents

* [backend/javaKt](#backendjavakt)
* [backend/javaKt/management](#backendjavaktmanagement)
* [backend/javaKt/packagePath](#backendjavaktpackagepath)
* [backend/language](#backendlanguage)
* [backend/php](#backendphp)
* [backend/php/modRewritePhpExtension](#backendphpmodrewritephpextension)
* [backend/php/runAsApi](#backendphprunasapi)
* [frontend/buildDir](#frontendbuilddir)
* [frontend/ghUser](#frontendghuser)
* [frontend/installDependencies](#frontendinstalldependencies)
* [frontend/language](#frontendlanguage)
* [frontend/architecture/modules/features](#frontendarchitecturemodulesfeatures)
* [frontend/architecture/modules/features/firstComponent](#frontendarchitecturemodulesfeaturesfirstcomponent)
* [frontend/architecture/modules/features/name](#frontendarchitecturemodulesfeaturesname)
* [frontend/architecture/modules/notFound](#frontendarchitecturemodulesnotfound)
* [frontend/architecture/modules/notFound/enabled](#frontendarchitecturemodulesnotfoundenabled)
* [frontend/architecture/modules/notFound/name](#frontendmodulesnotfoundname)
* [frontend/architecture/routing](#frontendarchitecturerouting)
* [frontend/architecture/standalone](#frontendarchitecturestandalone)
* [frontend/packageJson/contributors](#frontendpackagejsoncontributors)
* [frontend/packageJson/homepage](#frontendpackagejsonhomepage)
* [frontend/packageJson/repository](#frontendpackagejsonrepository)
* [frontend/prefix](#frontendprefix)
* [frontend/theme](#frontendtheme)
* [frontend/useGoogleFonts](#frontendusegooglefonts)
* [frontend/useYarn](#frontenduseyarn)
* [general/author](#generalauthor)
* [general/description](#generaldescription)
* [general/modRewriteIndex](#generalmodrewriteindex)
* [general/name](#generalname)
* [general/title](#generaltitle)
* [general/useDocker](#generalusedocker)
* [general/useMITLicense](#generalusemitlicense)
* [general/useSecurity](#generalusesecurity)

## `backend/javaKt`

This option depends on [backend/language](#backendlanguage) with `java` or `kt`.

## `backend/javaKt/management`

Defines the management tool of the app.

* default: `maven`
* type: `string`
* values: `maven`/`gradle`/

## `backend/javaKt/packagePath`

The package structure.

* default: EMPTY
* type: `string`

## `backend/language`

Defines the backend language of the app.

* default: `none`
* type: `string`
* values: `java`/`kt`/`nestjs`/`php`

## `backend/php`

This option depends on [backend/language](#backendlanguage) with `php`.

## `backend/php/modRewritePhpExtension`

Defines whether a .htaccess file should used or not.
This predefines no ending for php files.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `backend/php/runAsApi`

Defines that the backend is used as a api reference or not.
The api URL in frontend environment.ts and environment.prod.ts will be set to `./api/`.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `frontend/architecture/modules/features`

This option depends on [frontend/architecture/standalone](#frontendarchitecturestandalone).

## `frontend/architecture/modules/features/firstComponent`

The first component to be created.
This defines the default route and the redirect route.
This option ca be changed in the environment files.

* environment name: `defaultRoute`
* default: `hello-world`
* type: `string`

## `frontend/architecture/modules/features/name`

Defines the name of the features module.

* default: `features`
* type: `string`

## `frontend/architecture/modules/notFound`

This option depends on [frontend/architecture/standalone](#frontendarchitecturestandalone).

## `frontend/architecture/modules/notFound/enabled`

Defines whether the notFound module will be created and used or not.
On `true` a module and component will be created and used on routes are not existing.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `frontend/modules/notFound/name`

The name of the 404 module and component where to redirect if a route not exists.

* default: `not-found`
* type: `string`

## `frontend/architecture/routing`

Defines whether a navigation will be created and routing could be used.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `frontend/architecture/standalone`

Defines whether no modules for components should be created or not.
The hole app will be created with standalone components and the app root will be generated to react on this.
On `true` no module will be created.
On `false` modules will be created.
This can be used for components as pages like dashboard, contact, about or impress.
A not found module could be created, this depends on [frontend/architecture/modules/notFound/enabled](#frontendarchitecturemodulesnotfoundenabled).

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `frontend/buildDir`

Defines the build dir for the webapp.

* default: `dist`
* type: `string`

## `frontend/ghUser`

Defines the username for github if this project is shared on github.

* default: EMPTY
* type: `string`

## `frontend/installDependencies`

Defines whether swaaplate should install tools and frontend dependencies or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `frontend/language`

Defines the language of the app in frontend.

* default: `en`
* type: `string`

## `frontend/packageJson/contributors`

An array of contributers.

* default: EMPTY
* type: `array`

## `frontend/packageJson/homepage`

The website. If this option is empty and `frontend/packageJson/repository` is set, this will be the same.

* default: EMPTY
* type: `string`

## `frontend/packageJson/repository`

The repository. If `frontend/ghUser` is set, the repository will be generated automatically.

* default: EMPTY
* type: `string`

## `frontend/prefix`

A shortcut of the project, used in components like `hw-home` or `hw-app`.

* default: `hw`
* type: `string`

## `frontend/theme`

Name of a build-in theme from angular-material.
This option ca be changed in the environment files.

* environment name: `theme`
* default: `indigo-pink`
* type: `string`
* values: `deeppurple-amber`/`indigo-pink`/`pink-bluegrey`/`purple-green`

## `frontend/useGoogleFonts`

Defines whatever Google Fonts should be used or not.

* default: `true`
* type: `boolean`
* values: `true`/`false`

## `frontend/useYarn`

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
An empty Dockerfile and a docker compose file will be created.

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
