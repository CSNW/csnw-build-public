const debug = require('debug')('csnw-build:handlebars');
const { join, resolve, basename } = require('path');
const {
  Profiler,
  unixPath,
  unixJoin,
  toArray,
  requirePeer
} = require('@csnw-build/utils');

module.exports = (options = {}) => {
  let {
    partials,

    templates = ['**/*.{hbs,handlebars}'],
    namespace = 'TEMPLATES',
    dest = 'templates.js',
    getTemplateName = file => basename(file.path, file.ext),
    getPartialName = file => {
      let name = basename(file.path, file.ext);
      if (name.startsWith('_')) name = name.substr(1);
      return name;
    }
  } = options;

  partials = toArray(partials).map(part => unixJoin(part, '**/*'));
  const src = [...toArray(templates), ...partials];

  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/handlebars',

    async pipeline({ cwd, cache }) {
      const { branch, map, File, Files } = require('@csnw-build/pipeline');
      const { matcher } = require('@csnw-build/utils');
      const MagicString = require('magic-string');
      const handlebars = await requirePeer('handlebars', cwd);

      const toDeclaration = name =>
        (Array.isArray(name) ? name : name.split('.'))
          .map(part => `["${part}"]`)
          .join('');
      const declaration = `window${toDeclaration(namespace)}`;

      const isPartial = matcher(partials);

      const precompile = map({ profile, cache }, file => {
        const { code } = handlebars.precompile(file.contents.toString(), {
          srcName: file.relative
        });

        let contents;
        if (file.matches(isPartial)) {
          const name = getPartialName(file);
          contents = `Handlebars.registerPartial('${name}', Handlebars.template(${code}));`;
        } else {
          const name = getTemplateName(file);
          contents = `${declaration}${toDeclaration(
            name
          )} = Handlebars.template(${code});`;
        }

        file.contents = contents;
        return file;
      });

      return branch({ src, profile, cache }, async files => {
        files = await precompile(files);
        files = Array.from(files.files);

        const bundle = new MagicString.Bundle();
        for (const file of files) {
          bundle.addSource({
            filename: file.relative,
            content: new MagicString(file.contents.toString())
          });
        }

        const parts = namespace.split('.');
        const intro = parts
          .map((part, index) => {
            const declaration = `window${toDeclaration(
              parts.slice(0, index + 1)
            )}`;
            return `${declaration} = ${declaration} || {};`;
          })
          .join('\n');
        bundle.prepend(`${intro}\n`);

        const { cwd, baseDir } = files[0];
        const path = join(baseDir, dest);
        const result = new File({
          cwd,
          baseDir,
          path,
          contents: bundle.toString()
        });

        // TODO sorcery should be able to pick up sourcemaps from handlebars

        return new Files([result]);
      });
    }
  };
};
