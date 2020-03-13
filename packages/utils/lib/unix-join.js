const { join, normalize } = require('path');
const WINDOWS_REGEX = /\\/g;
const LEADING_SLASH = './';

module.exports = (...paths) => {
  let normalized = normalize(join(...paths)).replace(WINDOWS_REGEX, '/');
  if (paths[0].startsWith(LEADING_SLASH))
    normalized = LEADING_SLASH + normalized;

  return normalized;
};
