const mri = require('mri');
const args = mri(process.argv.slice(2));

if (args.debug) {
  let debug = args.debug;
  if (debug === true) debug = '@csnw/*';
  else if (Array.isArray(debug)) debug = debug.join(',');

  const filters = debug.split(',');
  const existing = process.env.DEBUG ? process.env.DEBUG.split(',') : [];

  process.env.DEBUG = existing.concat(filters).join(',');
}

const _setup = (options = {}) => {
  const mode = process.env.NODE_ENV || args.mode || options.mode || 'development';
  const host = process.env.HOST || args.host || options.host || 'localhost';
  const port = parseInt(process.env.PORT || args.port || options.port || 8080, 10);

  let browser = process.env.BROWSER;
  if (!browser) {
    if ('open' in args) browser = args.open ? undefined : 'none';
    else if (options.browser) browser = options.browser;
    else if ('open' in options) browser = options.open ? undefined : 'none';
  }

  process.env.NODE_ENV = mode;
  process.env.HOST = host;
  process.env.PORT = port;
  if (browser) process.env.BROWSER = browser;

  return { mode, host, port, browser, open: browser !== 'none' };
};

module.exports = Object.assign(_setup, {
  task(options = {}) {
    return function setup(callback) {
      try {
        _setup(options);
        callback();
      } catch (error) {
        callback(error);
      }
    };
  }
});
