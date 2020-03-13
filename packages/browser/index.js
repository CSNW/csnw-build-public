const debug = require('debug')('csnw-build:browser');
const openBrowser = require('react-dev-utils/openBrowser');

module.exports = (options = {}) => {
  return {
    name: '@csnw-build/browser',
    open(url) {
      openBrowser(url);
    }
  };
};
