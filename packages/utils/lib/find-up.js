const { dirname, basename, join, parse } = require('path');
const { exists } = require('fs-extra');
const toArray = require('./to-array');

const cache = new Map();

async function findUp(dir, filenames, root = parse(dir).root) {
  filenames = toArray(filenames);

  // Don't traverse above the module root
  if (dir === root || basename(dir) === 'node_modules') {
    return null;
  }

  for (const filename of filenames) {
    const file = join(dir, filename);
    const file_exists = cache.has(file) || (await exists(file));
    if (file_exists) {
      cache.set(file, true);
      return file;
    }
  }

  return findUp(dirname(dir), filenames, root);
}

module.exports = findUp;
