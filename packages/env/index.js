const debug = require('debug')('csnw-build:env');
const { Profiler } = require('@csnw-build/utils');

module.exports = (options = {}) => {
  const { src = '**/*.{js,html}' } = options;
  const profile = new Profiler(debug);

  const env = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (
      key === 'NODE_ENV' ||
      key === 'PUBLIC_URL' ||
      key.startsWith('CSNW_BUILD_')
    ) {
      env[key] = value;
    }
  }

  return {
    name: '@csnw-build/env',

    pipeline({ sourcemaps, cache }) {
      const { branch, map, applySourceMap } = require('@csnw-build/pipeline');
      const MagicString = require('magic-string');

      return branch(
        { src, profile, cache },
        map({ profile, cache }, async file => {
          const contents = file.contents.toString();
          const isJs = file.ext === '.js';
          const regex = isJs ? /process\.env\.(\w*)/g : /\%(\w*)\%/g;

          const matches = [];
          let match;
          while ((match = regex.exec(contents)) !== null) {
            const start = match.index;
            const end = start + match[0].length;

            const key = match[1];
            const content = isJs
              ? JSON.stringify(env[key] || '')
              : env[key] || '';

            matches.push({ start, end, content });
          }

          const replaced = new MagicString(contents);
          for (const match of matches.reverse()) {
            const { start, end, content } = match;
            replaced.overwrite(start, end, content);
          }

          file.contents = replaced.toString();
          if (sourcemaps) {
            const map = replaced.generateMap({
              source: file.relative,
              file: file.relative,
              includeContent: true
            });

            await applySourceMap(file, map);
          }

          return file;
        })
      );
    }
  };
};
