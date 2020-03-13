# csnw-build

csnw-build is designed to be a small and sharp tool that builds projects for development and production. Using a combination of build pipeline and bundler, a wide variety of projects are supported throughout the lifetime of the project. Based on plugins for common compilation steps (e.g. typescript and sass) and targets (e.g. browsers and electron), the implementation details for the build system live outside of the project so that lessons learned, bugfixes, and performance improvements can be shared by all projects.

## Goal API

```json
{
  "devDependencies": {
    "csnw-build": "git+https://github.com/CSNW/csnw-build#v0.1.0"
  },
  "scripts": {
    "dev": "csnw-build dev",
    "build": "csnw-build build",
    "check": "csnw-build check"
  }
}
```

```js
// ./csnw.config.js
//
// This configuration builds the project for electron,
// adding typescript and sass compilation to the build pipeline

const typescript = require('csnw-build/packages/typescript');
const sass = require('csnw-build/packages/sass');
const electron = require('csnw-build/packages/electron');

module.exports = {
  // (defaults)
  // src: ['src/**/*'],
  // dest: 'build'

  target: electron({ name: 'ELECTRON TEST' }),
  use: [typescript(), sass()]
};
```

```js
// ./csnw.config.js
//
// This configuration builds the project for IE9+,
// with bundling from src/index.js and using react and less

const babel = require('csnw-build/packages/babel');
const react = require('csnw-build/packages/react');
const less = require('csnw-build/packages/less');
const browser = require('csnw-build/packages/browser');

module.exports = {
  entry: 'src/index.js',

  target: browser('ie >= 9'),
  use: [react(), babel(), less()]
};
```

## Configuration

* `use` - Add plugins to the build pipeline/bundler
* `target` - Define project target
* `[dest = 'build']` - Select destination directory for pipeline/bundler
* `[sourcemaps = '.']` - Enable sourcemaps for the project (`true` = inline, string = external at path)

Pipeline:

* `[src = 'src/**/*']` - Select source files to pass through pipeline
* `[base]` - Set base path for determining relative paths for source files

Bundler:

* `[entry]` - Set entry file(s) for bundler (string or object)

## Plugins

See `packages/` for information on each plugin.

* [babel](https://github.com/CSNW/csnw-build/tree/master/packages/babel)
* [browser](https://github.com/CSNW/csnw-build/tree/master/packages/browser)
* [concat](https://github.com/CSNW/csnw-build/tree/master/packages/concat)
* [deploy-git](https://github.com/CSNW/csnw-build/tree/master/packages/deploy-git)
* [electron](https://github.com/CSNW/csnw-build/tree/master/packages/electron)
* [env](https://github.com/CSNW/csnw-build/tree/master/packages/env)
* [filter](https://github.com/CSNW/csnw-build/tree/master/packages/filter)
* [handlebars](https://github.com/CSNW/csnw-build/tree/master/packages/handlebars)
* [include](https://github.com/CSNW/csnw-build/tree/master/packages/include)
* [inline-source](https://github.com/CSNW/csnw-build/tree/master/packages/inline-source)
* [less](https://github.com/CSNW/csnw-build/tree/master/packages/less)
* [metalsmith](https://github.com/CSNW/csnw-build/tree/master/packages/metalsmith)
* [move](https://github.com/CSNW/csnw-build/tree/master/packages/move)
* [react](https://github.com/CSNW/csnw-build/tree/master/packages/react)
* [rollup](https://github.com/CSNW/csnw-build/tree/master/packages/rollup)
* [sass](https://github.com/CSNW/csnw-build/tree/master/packages/sass)
* [serve](https://github.com/CSNW/csnw-build/tree/master/packages/serve)
* [typescript](https://github.com/CSNW/csnw-build/tree/master/packages/typescript)
* [uglify](https://github.com/CSNW/csnw-build/tree/master/packages/uglify)

## References

* [https://github.com/CSNW/csnw-static-build](https://github.com/CSNW/csnw-static-build)
