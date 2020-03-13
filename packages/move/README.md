# @csnw-build/move

Move files in the build pipeline.

```js
// csnw.config.js
const move = require('csnw-build/packages/build');

module.exports = {
  use: [move({ src: 'a/b/**/*', dest: 'c', base: 'a/b/' })]
};
```

Pipeline Options:

* `[src = '**/*` - Select files from the pipeline
* `[base]` - Base for renaming files (e.g. `base = 'a'` and `file = 'a/b/c.txt'` rename to `b/c.txt`)
* `[dest]` - Move all files to the given destination
