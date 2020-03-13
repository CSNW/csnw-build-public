const debug = require('debug')('csnw-build:filter');
const { Profiler } = require('@csnw-build/utils');

module.exports = (pattern, options = {}) => {
  const { src } = options;
  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/filter',

    pipeline({ cache }) {
      const { branch, map } = require('@csnw-build/pipeline');

      return branch(
        { profile, cache },
        map({ profile, cache }, file => {
          return file.matches(pattern) ? file : null;
        })
      );
    }
  };
};
