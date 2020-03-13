const debug = require('debug')('csnw-build:rollup');
const { join, resolve, relative } = require('path');
const {
  Profiler,
  unixPath,
  requirePeer,
  toArray
} = require('@csnw-build/utils');
const {
  File,
  branch,
  bundle,
  applySourceMap
} = require('@csnw-build/pipeline');

module.exports = (config, options = {}) => {
  // TODO
  // if (typeof config === 'string') config = await loadConfig(config);

  const { src = '**/*.js' } = options;
  const profile = new Profiler(debug);
  const _bundles = new Map();

  return {
    name: '@csnw-build/rollup',

    async pipeline({ cwd, sourcemaps, cache }) {
      const { rollup } = await requirePeer('rollup', cwd);

      config = normalizeConfig(config, { sourcemaps });
      const entries = config.map(options => options.input);

      return branch(
        { src, profile, cache },
        bundle({ entries, profile, cache }, async (entry, files) => {
          const part = config.find(part => part.input === entry.relative);

          return rollupBundle(part, files, {
            rollup,
            _bundles,
            cwd,
            cache,
            sourcemaps
          });
        })
      );
    }
  };
};

async function rollupBundle(config, files, options = {}) {
  const {
    rollup,
    _bundles,
    cwd = process.cwd(),
    cache: useCache,
    sourcemaps: useSourcemaps
  } = options;

  // Update config with local values
  const input = unixPath(getFullPath(files, config.input) || config.input);
  const plugins = [include(files.toMap())].concat(config.plugins || []);
  const cache = useCache && _bundles.get(input);
  config = Object.assign({}, config, { input, plugins, cache });

  let bundle;
  try {
    bundle = await rollup(config);
  } catch (err) {
    if (!err.loc) throw err;

    const message = `${err.message} of ${unixPath(
      relative(cwd, err.loc.file)
    )}\n\n${err.snippet}`;
    throw new Error(message);
  }

  if (useCache) _bundles.set(input, bundle);

  const results = await Promise.all(
    config.output.map(async output => {
      const { code, map } = await bundle.generate(output);

      const path = join(cwd, output.file);
      const contents = code;
      const file = new File({ cwd, path, contents });

      if (useSourcemaps) {
        map.sources = map.sources.map(source => resolve(file.dir, source));
        await applySourceMap(file, map);
      }

      return file;
    })
  );
  const dependencies = bundle.modules.map(({ id }) => unixPath(id));

  return {
    bundle: results,
    dependencies
  };
}

function include(files) {
  return {
    name: '@csnw-build/rollup',
    load(id) {
      id = unixPath(id);
      if (files.has(id)) return files.get(id).contents.toString();
    }
  };
}

function getFullPath(files, relative) {
  for (const file of files) {
    if (unixPath(file.relative) === relative) {
      return file.path;
    }
  }
}

function normalizeConfig(config, { sourcemaps }) {
  return toArray(config).map(input => {
    const output = toArray(input.output).map(output => {
      const file = output.file || input.input;

      return Object.assign({}, output, { file, sourcemap: !!sourcemaps });
    });

    return Object.assign({}, input, { output });
  });
}
