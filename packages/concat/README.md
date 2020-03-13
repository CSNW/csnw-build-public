# @csnw-build/concat

Add file concatenation to build pipeline.

```js
// csnw.config.js
const concat = require('csnw-build/packages/concat');

module.exports = {
  src: ['src/**/*', 'node_modules/dep/dep.js', 'node_modules/dep-b/dep-b.css']
  use: [
    concat({
      'js/bundle.js': ['js/a.js', 'js/b.js', 'node_modules/dep/dep.js'],
      'css/main.css': ['css/component.css', 'node_modules/dep-b/dep-b.css']
    })
  ]
};
```

Options:

* `bundles` - object mapping destination (string) to src files (array of strings)
