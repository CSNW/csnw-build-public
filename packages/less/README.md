# @csnw-build/less

Add less compilation to the build pipeline and bundler.

```sh
npm i --save-dev less^2.7.3
```

```js
const less = require('csnw-build/packages/less');

module.exports = {
  use: [less()]
};
```

Pipeline Options:

* `[src = '**/*.less]` - Select files from the pipeline to include
* `[entry]` - Select entry file(s) to process and output (by default includes everything except for "partials": `**/_*.less`)
