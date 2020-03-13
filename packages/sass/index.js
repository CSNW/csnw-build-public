const debug = require('debug')('csnw-build:sass');
const { dirname } = require('path');
const { Profiler, requirePeer } = require('@csnw-build/utils');

module.exports = (options = {}) => {
  const {
    src = ['**/*.{sass,scss}'],
    entry: entries = ['!**/_*.{sass,scss}']
  } = options;
  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/sass',

    async pipeline({ cwd, sourcemaps, cache }) {
      const sass = await requirePeer('node-sass', cwd);
      const {
        branch,
        bundle,
        applySourceMap,
        removeSourceMapComments
      } = require('@csnw-build/pipeline');

      return branch(
        { src, profile, cache },
        bundle({ entries, profile, cache }, async (entry, files) => {
          return new Promise((resolve, reject) => {
            const name = entry.relative;
            const indentedSyntax = entry.ext === '.sass';

            sass.render(
              {
                file: entry.relative,
                data: entry.contents.toString(),
                includePaths: [dirname(entry.path)],
                sourceMap: !!sourcemaps,
                sourceMapContents: !!sourcemaps,
                outFile: entry.path,
                indentedSyntax
              },
              async (err, result) => {
                if (err) return reject(err);

                entry.ext = '.css';
                entry.contents = removeSourceMapComments(result.css.toString());

                if (sourcemaps && result.map) {
                  await applySourceMap(entry, result.map);
                }

                const dependencies = result.stats.includedFiles;

                resolve({ bundle: entry, dependencies });
              }
            );
          });
        })
      );
    }
  };
};
