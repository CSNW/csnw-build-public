const Files = require('./files');
const { formatTime, isString } = require('@csnw-build/utils');

module.exports = (options, callback) => {
  if (isString(options) || Array.isArray(options)) {
    options = { src: options };
  }
  const { src: patterns, profile, cache = true } = options;

  const { matcher } = require('@csnw-build/utils');
  const isMatch =
    !patterns || patterns === '**/*' ? () => true : matcher(patterns);

  let files_snapshot = new Map();
  let matches = new Map();
  let matches_snapshot = new Map();
  let cached;

  return async files => {
    profile && profile.start();

    // 1. Find changes in input files
    let changes;
    if (cache) {
      const next = files.snapshot();

      changes = Files.compare(next, files_snapshot);
      files_snapshot = next;
    } else {
      changes = Files.compare(files, new Map());
      matches = new Map();
    }

    // 2. Update matches from changes
    const byPath = files.toMap();
    for (const added of changes.added) {
      const file = byPath.get(added);
      matches.set(added, file.matches(isMatch));
    }
    for (const modified of changes.modified) {
      const file = byPath.get(modified);
      matches.set(modified, file.matches(isMatch));
    }
    for (const removed of changes.removed) {
      matches.delete(removed);
    }

    // 3. Collect all matching and passthrough files
    const matching = new Files();
    const passthrough = new Files();
    for (const [path, result] of matches) {
      if (result) matching.add(byPath.get(path));
      else passthrough.add(byPath.get(path));
    }
    profile.matching = matching.size;

    // 4. Determine if matching files have changed
    let changed = true;
    if (cache) {
      const next = matching.snapshot();

      changes = Files.compare(next, matches_snapshot);
      matches_snapshot = next;

      changed = !cached || changes.size;
      if (!changed) profile.skipped = true;
    }

    // 5. Process files (or use cached result)
    const result = changed
      ? matching.size ? await callback(matching) : new Files()
      : cached.clone();
    if (cache) cached = result.clone();
    if (!matching.size) profile.skipped = true;

    // 6. Combine with passthrough files and return
    const combined = Files.merge(passthrough, result);

    profile && profile.done();
    return combined;
  };
};
