# @csnw-build/uglify

Add uglify-es minification to the build pipeline and bundler (for `--mode=production`).

```sh
npm i --save-dev uglify-es^3.3.10
```

```js
// csnw.config.js
const uglify = require('csnw-build/packages/uglify');

module.exports = {
  use: [uglify()]
};
```

Pipeline Options:

* `[src = '**/*.js']` - Select files from the pipeline to process
