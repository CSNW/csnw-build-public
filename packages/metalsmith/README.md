# @csnw-build/metalsmith

Add metalsmith compilation to the build pipeline.

```sh
npm i --save-dev handlebars^4.0.11
```

```js
// csnw.config.js
const metalsmith = require('csnw-build/packages/metalsmith');

module.exports = {
  use: [metalsmith()]
};
```

Pipeline Options:

* `[pages = '**/*.html']` - Select pages from the pipeline
* `[layouts = './src/layouts']` - Handlebars layouts files (relative to cwd)
* `[partials = './src/partials']` - Handlebars partials files (relative to cwd)
* `[helpers]` - Handlebars helpers
