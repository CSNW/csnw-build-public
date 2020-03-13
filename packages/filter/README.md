# @csnw-build/filter

Filter files from build pipeline

```js
// csnw.config.js
const filter = require('csnw-build/packages/filter');

module.exports = {
  // remove all markdown files and specific file from pipeline
  use: [filter(['**/*.md', 'specific-file.txt'])]
};
```

Options:

* `pattern` - glob pattern(s) to remove from pipeline
* `[options.src = '**/*']` - subset of files to search from pipeline
* `[options...]` - See [minimatch options](https://github.com/isaacs/minimatch#options)
