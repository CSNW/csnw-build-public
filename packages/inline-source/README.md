# @csnw-build/inline-source

Inline js and css with `inline` property in html files.

```js
// csnw.config.js
const inlineSource = require('csnw-build/packages/inline-source');

module.exports = {
  use: [inlineSource()]
};
```

Pipeline Options:

* `[pages = '**/*.html]` - Select html files from the pipeline to process
