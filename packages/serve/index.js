const debug = require('debug')('csnw-build:serve');
const { join } = require('path');
const serveStatic = require('serve-static');
const { unixPath } = require('@csnw-build/utils');

module.exports = (mapping = {}) => {
  if (typeof mapping === 'string') mapping = { [mapping]: mapping };
  if (Array.isArray(mapping)) mapping = toObject(mapping);
  const cwd = process.cwd();

  return {
    name: '@csnw-build/serve',
    connect(server) {
      for (const [url, path] of Object.entries(mapping)) {
        const formattedUrl = unixPath(join('/', url));
        const fullPath = join(cwd, path);

        debug(`serving ${fullPath} at ${formattedUrl}`);
        server.use(formattedUrl, serveStatic(fullPath));
      }
    }
  };
};

function toObject(values) {
  const obj = {};
  for (const value of values) {
    obj[value] = value;
  }
  return obj;
}
