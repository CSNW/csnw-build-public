const debug = require('debug')('csnw-build:concat');
const { join, resolve } = require('path');
const { unixPath, Profiler, toArray, flatten } = require('@csnw-build/utils');

module.exports = (_bundles = {}) => {
  const bundles = Object.keys(_bundles).map(target => {
    const files = toArray(_bundles[target]).map(file => unixPath(file));
    if (!files.length) return;

    target = unixPath(target);
    return { target, src: files };
  });
  const entries = bundles.map(bundle => bundle.target);
  const src = flatten(bundles.map(bundle => bundle.src));
  const srcToFiles = {};

  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/concat',

    pipeline({ cwd, sourcemaps, cache }) {
      const {
        branch,
        bundle,
        File,
        applySourceMap
      } = require('@csnw-build/pipeline');
      const Concat = require('concat-with-sourcemaps');

      const concat = bundle(
        { entries, profile, cache },
        async (entry, files) => {
          const bundle = bundles.find(bundle => bundle.path === entry.path);
          if (!bundle) {
            debug(`WARNING bundle not found for entry "${entry.path}"`);
          }

          const concat = new Concat(!!sourcemaps, entry.relative, '\n');
          const dependencies = bundle.paths;
          const sourcesContent = [];

          for (const file of bundle.files) {
            concat.add(file.path, file.contents, file.sourceMap);
            sourcesContent.push(file.contents.toString());
          }

          entry.contents = concat.content;
          if (sourcemaps) {
            const map = JSON.parse(concat.sourceMap);
            map.sourcesContent = sourcesContent;

            await applySourceMap(entry, map);
          }

          return { bundle: entry, dependencies };
        }
      );

      return branch({ src, profile, cache }, files => {
        // Map src to files
        for (const path of src) {
          const file = find(path, files);
          srcToFiles[path] = file;
        }

        // Add entries to files before bundling
        for (const bundle of bundles) {
          // Get matching files and skip if missing any
          const matching = bundle.src.map(path => srcToFiles[path]);
          if (!matching.every(Boolean)) {
            debug(
              `WARNING not all files were found for bundle "${bundle.target}"`
            );
            continue;
          }

          const { cwd, baseDir } = matching[0];
          const path = unixPath(join(baseDir, bundle.target));

          bundle.files = matching;
          bundle.paths = matching.map(file => file.path);
          bundle.path = path;

          const generated = new File({ cwd, baseDir, path });
          files.add(generated);
        }

        return concat(files);
      });
    }
  };
};

function find(search, files) {
  for (const file of files) {
    if (file.matches(search)) {
      return file;
    }
  }
}
