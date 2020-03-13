// Inspired by parcel
// https://github.com/parcel-bundler/parcel/blob/32c38e599161372cd47924f0f4cf2aae32eb5b83/src/utils/localRequire.js

// Peer dependencies are listed in each package/preset so that they are only installed as-needed
// install them automatically on usage with requirePeer (also ensures peer dependency is correct version)

const resolve = require('resolve');
const unixPath = require('./unix-path');
const installPackage = require('./install-package');

const cache = new Map();

async function requirePeer(name, cwd = process.cwd(), tried_install = false) {
  const basedir = unixPath(cwd);
  const key = basedir + ':' + name;
  let resolved = cache.get(key);
  if (!resolved) {
    try {
      resolved = resolve.sync(name, { basedir });
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND' && !tried_install) {
        await installPackage(cwd, name);
        return requirePeer(name, cwd, true);
      }
      throw e;
    }
    cache.set(key, resolved);
  }

  return require(resolved);
}

module.exports = requirePeer;
