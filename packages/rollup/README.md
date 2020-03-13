# @csnw-build/rollup

Add rollup bundling to the build pipeline.

```sh
npm i --save-dev rollup^0.55
```

```js
// csnw.config.js
const rollup = require('csnw-build/packages/rollup');

module.exports = {
  use: [
    rollup(
      {
        input: 'js/index.js',
        output: {
          format: 'iife'
        }
      },
      { base: 'src' }
    )
  ]
};
```

Multiple inputs and outputs are supported:

```js
// csnw.config.js
const rollup = require('csnw-build/packages/rollup');

module.exports = {
  use: [
    rollup(
      [
        {
          input: 'js/index.js',
          output: [
            {
              file: 'js/index.umd.js',
              format: 'umd'
            },
            {
              file: 'js/index.es.js',
              format: 'es'
            }
          ]
        },
        {
          input: 'js/main.js',
          output: {
            format: 'iife'
          }
        }
      ],
      { base: 'src' }
    )
  ]
};
```

For more information on supported options, see [Rollup Configuration](https://rollupjs.org/guide/en#configuration-files)
