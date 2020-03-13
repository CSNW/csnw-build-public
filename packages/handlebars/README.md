# @csnw-build/handlebars

Add handlebars template/partial pre-compilation to the build pipeline and bundler.

```sh
npm i --save-dev handlebars^4.0.11
```

```js
const handlebars = require('csnw-build/packages/handlebars');

module.exports = {
  use: [handlebars()]
};
```

Shared Options:

* `[partials]` - Partials directory (relative to cwd, e.g. `./src/partails`)

Pipeline Options:

* `[templates = '**/*.{hbs,handlebars}']` - Select templates files from the pipeline
* `[namespace = 'TEMPLATES']` - Global namespace to define templates
* `[dest = 'templates.js']` - Output pre-compiled templates/partials to given location
* `[getTemplateName]` - Convert `path -> template name` (e.g. `templates\a.hbs`, path = `templates/a`)
