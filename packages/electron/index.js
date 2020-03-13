const debug = require('debug')('csnw-build:electron');

module.exports = (options = {}) => {
  return {
    name: '@csnw-build/electron',
    open() {
      debug('TODO Open application');
    }
  };
};
