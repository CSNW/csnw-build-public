# @csnw-build/rev

Add revision hash to project assets and replace in project files (e.g. `main.js` becomes `main-d41d8cd98f.js`)

```js
// csnw.config.js
const rev = require('csnw-build/packages/rev');

module.exports = {
  use: [rev()]
};
```

Pipeline Options:

* `[rev = '**/*.{js,css,png,jpg,jpeg,gif,svg}']` - Select files that should have revision hash added
* `[replace = '**/*.{js,css,html,hbs}]` - Select files that have paths that need to be replaced
