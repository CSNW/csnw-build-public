const debug = require('debug')('csnw-build:babel');
const { Profiler, requirePeer } = require('@csnw-build/utils');

module.exports = (options = {}) => {
  const { src = ['**/*.{js,jsx}'] } = options;
  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/babel',

    async pipeline({ cwd, sourcemaps, cache }) {
      const { branch, map, applySourceMap } = require('@csnw-build/pipeline');
      const babel = await requirePeer('@babel/core', cwd);

      return branch(
        { src, profile, cache },
        map({ profile, cache }, async file => {
          const options = {
            filename: file.path,
            filenameRelative: file.relative,
            sourceMap: Boolean(sourcemaps),
            sourceFileName: file.relative
          };

          const result = babel.transform(file.contents.toString(), options);

          if (result && !result.ignored) {
            const { code, map } = result;
            file.ext = '.js';
            file.contents = code;

            if (sourcemaps) {
              await applySourceMap(file, map);
            }
          }

          return file;
        })
      );
    }
  };
};
