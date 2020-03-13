# @csnw-build/clean-css

Add css minification to pipeline (for `--mode=production`).

```js
// csnw.config.js
const cleanCss = require('csnw-build/packages/clean-css');

module.exports = {
  use: [cleanCss()]
};
```

Pipeline Options:

* `[src = '**/*.css']` - Select files from the pipeline to process
