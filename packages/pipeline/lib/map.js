const Files = require('./files');
const { formatTime } = require('@csnw-build/utils');

module.exports = (options, iterator) => {
  if (typeof options === 'function') {
    iterator = options;
    options = {};
  }

  const { profile } = options;
  const cache = options.cache != null ? !!options.cache : true;
  let _hashes = new Map();
  let _results = new Map();

  return async files => {
    const mapping = [];
    const paths = [];
    const hashes = [];

    for (const file of files) {
      const path = file.path;
      const hash = file.hash;
      const changed = !cache || _hashes.get(path) !== hash;

      if (changed) {
        mapping.push(iterator(file));
        profile && profile.processed++;
      } else {
        mapping.push(clone(_results.get(path)));
        profile && profile.cached++;
      }

      paths.push(path);
      hashes.push(hash);
    }

    const mapped = await Promise.all(mapping);
    const results = new Files(mapped.filter(Boolean));

    if (cache) {
      _hashes.clear();
      _results.clear();

      paths.forEach((path, index) => {
        const result = clone(mapping[index]);

        _hashes.set(path, hashes[index]);
        _results.set(path, result);
      });
    }

    return results;
  };
};

function clone(value) {
  return value && value.clone ? value.clone() : value;
}
