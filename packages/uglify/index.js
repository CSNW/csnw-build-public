const debug = require('debug')('csnw-build:uglify');
const { Profiler, requirePeer } = require('@csnw-build/utils');

module.exports = (options = {}) => {
  const { src = ['**/*.js'] } = options;
  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/uglify',

    async pipeline({ mode, cwd, sourcemaps, cache }) {
      const {
        branch,
        map,
        skip,
        applySourceMap
      } = require('@csnw-build/pipeline');
      const { minify } = await requirePeer('uglify-es', cwd);

      if (mode !== 'production') return skip({ profile });

      return branch(
        { src, profile, cache },
        map({ profile, cache }, async file => {
          const contents = file.contents.toString();
          const result = minify(
            { [file.relative]: contents },
            { sourceMap: !!sourcemaps }
          );

          if (result.error) throw new Error(result.error);

          file.contents = result.code;

          if (sourcemaps && result.map) {
            const map = JSON.parse(result.map);
            map.sourcesContent = [contents];

            await applySourceMap(file, map);
          }

          return file;
        })
      );
    }
  };
};
