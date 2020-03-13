const debug = require('debug')('csnw-build:react');

module.exports = (options = {}) => {
  // TODO Validate babelrc and other best practices (e.g. add react devtools to electron)

  return {
    name: '@csnw-build/react'
  };
};
