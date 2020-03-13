# @csnw-build/include

Include additional files in build pipeline.

```js
// csnw.config.js
const include = require('csnw-build/packages/include');

module.exports = {
  use: [
    include(['node_modules/a/a.js', 'node_modules/b/b.css'], { base: '.' }),
    include('docs/**/*')
  ]
};

Options:

* `src` - source glob(s) to add to pipeline
* `[options.base]` - file "base" for setting relative path
```
