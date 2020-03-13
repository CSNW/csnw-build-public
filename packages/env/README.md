# @csnw-build/env

Load environment variables into js and html. Instances of `process.env...` are replaced in js and `%...%` are replaced in html and only `NODE_ENV`, `PUBLIC_URL`, and `CSNW_BUILD_...` environment variables are passed through.

```js
// csnw.config.js
const env = require('csnw-build/packages/env');

module.exports = {
  use: [env()]
};
```

Pipeline Options:

* `[src = '**/*.{js,html}]` - Select files from the pipeline to process
