const debug = require('debug')('csnw-build:metalsmith');
const {
  requirePeer,
  toArray,
  unixPath,
  unixJoin,
  Profiler
} = require('@csnw-build/utils');

module.exports = (options = {}) => {
  const {
    pages = '**/*.html',
    layouts = './src/layouts',
    partials = './src/partials',
    helpers,
    metadata = {},
    base,
    dest
  } = options;
  const profile = new Profiler(debug);
  let _hashes = new Map();
  let _results = new Map();

  const { matcher } = require('@csnw-build/utils');
  const layouts_src = unixPath(unixJoin(layouts, '**/*'));
  const isLayout = matcher(layouts_src);

  const partials_src = unixPath(unixJoin(partials, '**/*'));
  const isPartial = matcher(partials_src);

  const src = [...toArray(pages), layouts_src, partials_src];

  return {
    name: '@csnw-build/metalsmith',

    async pipeline({ cwd, cache }) {
      const { branch, map, File, Files } = require('@csnw-build/pipeline');
      const handlebars = await requirePeer('handlebars', cwd);

      const useLayouts = require('metalsmith-layouts');
      const inPlace = require('metalsmith-in-place');
      const frontmatter = require('front-matter');
      const Metalsmith = require('./lib/metalsmith');

      const hbs = {
        engine: 'handlebars',
        directory: layouts,
        partials,
        exposeConsolidate(requires) {
          requires.handlebars = handlebars;
        }
      };

      const metalsmith = new Metalsmith({ cwd });
      metalsmith.use([useLayouts(hbs), inPlace(hbs)]);
      metalsmith.metadata(metadata);

      return branch({ src, cache, profile }, async files => {
        // TODO Caching
        // - if layout or partial changes, reprocess all
        // - otherwise, process only changed pages

        const page_files = {};
        for (const file of files) {
          if (file.matches(isLayout) || file.matches(isPartial)) {
            continue;
          }

          const parsed = frontmatter(file.contents.toString());
          const page = Object.assign(
            {
              contents: Buffer.from(parsed.body),
              cwd: file.cwd,
              baseDir: file.baseDir,
              path: file.path
            },
            parsed.attributes
          );

          page_files[file.relative] = page;
        }

        return new Promise((resolve, reject) => {
          metalsmith.run(page_files, metalsmith, (err, results) => {
            if (err) return reject(err);

            const processed = [];
            for (const result of Object.values(results)) {
              profile.processed += 1;
              processed.push(new File(result));
            }

            resolve(new Files(processed));
          });
        });
      });
    }
  };
};

function registerHelpers(handlebars, helpers) {
  if (typeof helpers === 'string') {
    // TODO Load helpers from helpers directory
  } else if (helpers) {
    for (const [name, helper] of Object.entries(helpers)) {
      handlebars.registerHelper(name, helper);
    }
  }
}
