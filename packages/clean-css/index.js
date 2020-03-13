const debug = require('debug')('csnw-build:clean-css');
const { Profiler, requirePeer } = require('@csnw-build/utils');

module.exports = (options = {}) => {
  const { src = '**/*.css' } = options;
  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/clean-css',
    async pipeline({ mode, cwd, cache, sourcemaps }) {
      const {
        branch,
        map,
        skip,
        applySourceMap
      } = require('@csnw-build/pipeline');
      const CleanCss = await requirePeer('clean-css', cwd);

      if (mode !== 'production') return skip({ profile });

      const clean = new CleanCss({
        sourceMap: !!sourcemaps,
        returnPromise: true
      });

      return branch(
        { src, cache, profile },
        map({ cache, profile }, async file => {
          const contents = file.contents.toString();
          const { styles, sourceMap } = await clean.minify({
            [file.base]: { styles: contents }
          });

          file.contents = styles;
          if (sourcemaps && sourceMap) {
            const map = sourceMap.toJSON();
            map.sourcesContent = [contents];

            await applySourceMap(file, map);
          }

          return file;
        })
      );
    }
  };
};
