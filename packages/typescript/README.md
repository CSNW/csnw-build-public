# @csnw-build/typescript

Add typescript compilation to the build pipeline and bundler. Define typescript options in `tsconfig.json` at the root of the project.

```sh
npm i --save-dev typescript^2.6
```

```js
const typescript = require('csnw-build/packages/typescript');

module.exports = {
  use: [typescript()]
};
```

Pipeline Options:

* `[src = '**/*.{ts,tsx}']` - Select files from the pipeline to process
