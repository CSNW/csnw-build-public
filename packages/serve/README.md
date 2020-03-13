# @csnw-build/serve

Serve folders on the development server.

```js
// csnw.config.js
const serve = require('csnw-build/packages/serve');

module.exports = {
  use: [
    serve(['docs', 'nested/files'])

    // Optionally, provide mapping from server-to-client
    serve({
      'server/side': 'client/side'
    })
  ]
};
```
