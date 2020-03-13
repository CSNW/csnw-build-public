# @csnw-build/preset-static-build

See [https://github.com/CSNW/csnw-static-build](https://github.com/CSNW/csnw-static-build) for options.

```js
// csnw.config.js
const staticBuild = require('csnw-build/presets/static-build');
const config = require('./package.json')['csnw-static-build'];

module.exports = staticBuild(config);
```
