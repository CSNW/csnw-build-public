const { promisify } = require('util');
const { join, relative: rel } = require('path');
const expandGlob = promisify(require('glob'));
const globBase = require('glob-base');
const { toArray } = require('@csnw-build/utils');

module.exports = async (patterns, options = {}) => {
  patterns = toArray(patterns);

  const { cwd = process.cwd() } = options;
  const positives = [];
  const negatives = [];

  patterns.forEach((pattern, index) => {
    const glob = toGlob(pattern);
    const result = { index, pattern: glob.pattern, baseDir: glob.baseDir };

    if (glob.negated) negatives.push(result);
    else positives.push(result);
  });

  if (!positives.length) {
    throw new Error(
      `At least one non-negated pattern is required for expandGlobs, received ${patterns}`
    );
  }

  const loading = positives.map(async glob => {
    const ignore = negatives
      .filter(negative => negative.index > glob.index)
      .map(negative => negative.pattern)
      .concat(toArray(options.ignore));

    const matches = await expandGlob(
      glob.pattern,
      Object.assign({}, options, { cwd, ignore })
    );
    const baseDir = join(cwd, glob.baseDir);

    return { matches, baseDir };
  });
  const results = await Promise.all(loading);

  const unique = new Set();
  const paths = results.reduce((memo, { matches, baseDir }) => {
    for (const match of matches) {
      const path = join(cwd, match);

      if (unique.has(path)) continue;
      unique.add(path);

      const relative = rel(baseDir, path);
      memo.push({ cwd, baseDir, relative, path });
    }

    return memo;
  }, []);

  return paths;
};

function toGlob(pattern) {
  const glob = { pattern, negated: false };

  if (pattern.charAt(0) === '!' && pattern.charAt(1) !== '(') {
    glob.negated = true;
    glob.pattern = pattern.slice(1);
  }
  glob.baseDir = globBase(glob.pattern).base;

  return glob;
}
