const { matcher, isMatch } = require('micromatch');
const toArray = require('./to-array');

module.exports = {
  matcher(patterns) {
    return matcher(normalize(patterns), { basename: true });
  },

  isMatch(value, patterns) {
    return isMatch(value, normalize(patterns), { basename: true });
  }
};

function normalize(patterns) {
  return toArray(patterns).map(pattern => {
    if (pattern.startsWith('./')) return pattern;
    if (pattern.startsWith('*')) return pattern;
    if (pattern.startsWith('!')) return `!**/${pattern.slice(1)}`;
    return `**/${pattern}`;
  });
}
