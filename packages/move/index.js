const debug = require('debug')('csnw-build:move');
const assert = require('assert');
const { join } = require('path');
const { Profiler } = require('@csnw-build/utils');

module.exports = (src, dest) => {
  if (!dest) {
    dest = src;
    src = undefined;
  }
  assert(
    dest,
    `"destination" is required for move. (e.g. move('dest') or move('src/*', 'dest')`
  );

  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/move',
    pipeline({ cache }) {
      const { branch, map } = require('@csnw-build/pipeline');

      return branch(
        { src, profile, cache },
        map({ profile, cache }, file => {
          file.path = join(file.baseDir, dest, file.relative);
          return file;
        })
      );
    }
  };
};
