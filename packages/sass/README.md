# @csnw-build/sass

Add sass compilation to the build pipeline and bundler.

```sh
npm i --save-dev node-sass^4.7.2
```

```js
const sass = require('csnw-build/packages/sass');

module.exports = {
  use: [sass()]
};
```

Pipeline Options:

* `[src = '**/*.{scss,sass}]` - Select files from the pipeline to include
* `[entry]` - Select entry file(s) to process and output (by default includes everything except for "partials": `**/_*.{sass,scss}`)
