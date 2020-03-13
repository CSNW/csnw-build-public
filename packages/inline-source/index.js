const debug = require('debug')('csnw-build:inline-source');
const { join, relative } = require('path');
const { toArray, Profiler, unixPath, unixJoin } = require('@csnw-build/utils');

module.exports = (options = {}) => {
  const {
    pages = '**/*.html',
    public_url = process.env.PUBLIC_URL || '/'
  } = options;
  const src = toArray(pages).concat(['**/*.js', '**/*.css']);
  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/inline-source',
    pipeline({ cwd, cache }) {
      const { inlineSource } = require('inline-source');
      const { branch, bundle } = require('@csnw-build/pipeline');

      return branch(
        { src, cache, profile },
        bundle({ entries: pages, cache, profile }, async (entry, files) => {
          const byPath = files.toMap();
          const dependencies = [];

          const result = await inlineSource(entry.contents.toString(), {
            fs: {
              readFileSync(filepath) {
                rel = relative(join(cwd, public_url), filepath);
                const path = unixJoin(cwd, rel);

                if (!byPath.has(path)) {
                  throw new Error(`Could not find "${rel}" in files`);
                }

                dependencies.push(path);
                return byPath.get(path).contents.toString();
              }
            },
            rootpath: cwd
          });

          entry.contents = result;

          return { bundle: entry, dependencies };
        })
      );
    }
  };
};
