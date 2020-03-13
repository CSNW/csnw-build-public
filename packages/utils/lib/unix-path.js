const { normalize } = require('path');
const WINDOWS_REGEX = /\\/g;
const LEADING_SLASH = './';

module.exports = path => {
  let normalized = normalize(path).replace(WINDOWS_REGEX, '/');
  if (path.startsWith(LEADING_SLASH)) normalized = LEADING_SLASH + normalized;

  return normalized;
};
