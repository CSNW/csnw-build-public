const debug = require('debug')('csnw-build:include');
const { Profiler } = require('@csnw-build/utils');

module.exports = (src, options) => {
  const profile = new Profiler(debug);
  let cached;

  return {
    name: '@csnw-build/include',

    pipeline({ cache }) {
      const { Files } = require('@csnw-build/pipeline');

      return async files => {
        profile.start();

        let included;
        if (cache && cached) {
          included = cached.clone();
          profile.skipped = true;
        } else {
          included = await Files.from(src, options);

          // Pre-compute hash for initial load (helps with branch/snapshot performance)
          for (const file of included) {
            file.hash;
          }

          profile.matching += included.size;

          if (cache) cached = included.clone();
        }

        const merged = Files.merge(files, included);
        profile.done();

        return merged;
      };
    }
  };
};
