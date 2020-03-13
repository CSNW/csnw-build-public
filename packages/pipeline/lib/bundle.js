const Files = require('./files');
const { unixPath, isString, toArray } = require('@csnw-build/utils');

module.exports = (options, iterator) => {
  if (isString(options) || Array.isArray(options)) {
    options = { entries: options };
  }
  const { entries: patterns, profile } = options;
  const cache = options.cache != null ? !!options.cache : true;

  const { matcher } = require('@csnw-build/utils');
  const isMatch = !patterns ? () => true : matcher(patterns);

  const _cache = new Map();
  let _last;

  return async files => {
    const changes = Files.compare(files, _last);
    _last = files.snapshot();

    let all_dependencies = [];
    let all_bundles = [];

    const entries = files.filter(file => file.matches(isMatch));

    for (const entry of entries) {
      const path = entry.path;
      const cached = cache && _cache.get(path);
      const changed = !cached || hasChanges(path, cached.dependencies, changes);

      let dependencies, bundles;
      if (changed) {
        const result = await iterator(entry, files);
        dependencies = (result.dependencies || []).map(dependency =>
          unixPath(dependency)
        );
        bundles = toArray(result.bundle);
        profile && profile.processed++;
      } else {
        dependencies = cached.dependencies;
        bundles = cached.bundles.map(bundle => bundle.clone());
        profile && profile.cached++;
      }

      all_dependencies = all_dependencies.concat(dependencies);
      all_bundles = all_bundles.concat(bundles);

      if (cache) {
        _cache.set(path, {
          dependencies,
          bundles: bundles.map(file => file.clone())
        });
      }
    }

    // Ensure dependencies are unique and removed from returned files
    const ignore = new Set([
      ...all_dependencies.map(dependency => unixPath(dependency)),
      ...entries.map(entry => entry.path)
    ]);

    const results = [];
    for (const file of files) {
      if (!ignore.has(file.path)) {
        results.push(file);
      }
    }
    for (const bundle of all_bundles) {
      results.push(bundle);
    }

    return new Files(results);
  };
};

function hasChanges(entry, dependencies = [], changes) {
  for (const change of changes.modified) {
    if (change === entry) return true;
    if (dependencies.includes(change)) return true;
  }

  return false;
}
