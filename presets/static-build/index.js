const { join } = require('path');

const { unixPath, requirePeer } = require('@csnw-build/utils');
const include = require('@csnw-build/include');
const concat = require('@csnw-build/concat');
const less = require('@csnw-build/less');
const cleanCss = require('@csnw-build/clean-css');
const handlebars = require('@csnw-build/handlebars');
const rollup = require('@csnw-build/rollup');
const uglify = require('@csnw-build/uglify');
const metalsmith = require('@csnw-build/metalsmith');
const inlineSource = require('@csnw-build/inline-source');
const rev = require('@csnw-build/rev');
const serve = require('@csnw-build/serve');
const browser = require('@csnw-build/browser');

const defaults = {
  cwd: process.cwd(),
  src: 'src/',
  build: 'build/',
  baseurl: '/',
  port: 4000,
  livereload: 35729,
  html: {
    partials: './src/partials/',
    layouts: './src/layouts/'
  },
  js: {
    concat: {},
    templates: 'js/templates/',
    rollup: 'js/main.js',
    namespace: 'APP',
    globals: {
      APP: 'APP'
    },
    lint: ['js/**/*.js', '!js/vendor/**/*']
  },
  css: {
    concat: {},
    less: 'css/main.less'
  },
  static: {},
  rev: ['**/*', '!**/*.{html,map,eot,woff2,woff,ttf,svg}']
};

module.exports = (options = {}) => {
  // Load defaults
  const config = Object.assign({}, defaults, options);

  config.html = Object.assign({}, defaults.html, options.html);
  config.js = Object.assign({}, defaults.js, options.js);
  config.css = Object.assign({}, defaults.css, options.css);

  const external = flatten([
    ...Object.values(config.css.concat),
    ...Object.values(config.js.concat)
  ]).filter(file => {
    return (
      file.startsWith('./') ||
      file.startsWith('.\\') ||
      file.startsWith('node_modules')
    );
  });

  const templatesFolder = unixPath(
    join(config.cwd, config.src, config.js.templates)
  );

  return {
    src: `${config.src}**/*`,
    target: browser(),
    use: [
      include(external, { baseDir: config.cwd }),
      less({ entry: config.css.less }),
      concat(config.css.concat),
      cleanCss(),

      handlebars({
        namespace: `${config.js.namespace}.templates`,
        getTemplateName: file =>
          file.path
            .replace(/\\/g, '/')
            .replace(templatesFolder, '')
            .replace(file.ext, ''),
        templates: `${config.js.templates}**/*.hbs`,
        partials: config.html.partials,
        dest: 'js/templates.js'
      }),
      concat(config.js.concat),
      (async () => {
        const json = await requirePeer('rollup-plugin-json');
        const buble = await requirePeer('rollup-plugin-buble');

        return rollup(
          {
            input: config.js.rollup,
            plugins: [json(), buble()],
            external: Object.keys(config.js.globals),
            output: {
              format: 'iife',
              globals: config.js.globals
            }
          },
          { src: '**/*.{js,json}' }
        );
      })(),

      uglify(),

      metalsmith({
        layouts: config.html.layouts,
        partials: config.html.partials,
        helpers: {
          eq: (a, b) => a == b
        },
        metadata: {
          baseurl: process.env.PUBLIC_URL || config.baseurl
        }
      }),
      inlineSource({
        public_url: process.env.PUBLIC_URL || config.baseurl
      }),
      rev(),

      serve(config.static)
    ]
  };
};

function flatten(values) {
  return values.reduce((memo, value) => memo.concat(value), []);
}
