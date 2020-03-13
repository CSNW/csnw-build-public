const debug = require('debug')('csnw-build:pipeline');
const debounce = require('just-debounce');
const chalk = require('chalk');
const { formatTime, Profiler, findPort } = require('@csnw-build/utils');
const Input = require('./lib/input');
const Output = require('./lib/output');
const pipe = require('./lib/pipe');

module.exports = exports = options => ({
  name: 'Pipeline',
  run: async function pipeline(config, args, task) {
    const {
      mode = 'production',
      cwd = process.cwd(),
      cache = true,
      watch = false,
      server
    } = args;
    const sourcemaps = config.sourcemaps || '.';

    const profile = new Profiler(debug);

    const input = new Input(config.src, { cwd });
    const output = new Output(config.dest);

    profile.time('load plugins');
    const steps = await Promise.all(
      config.use.filter(plugin => plugin.pipeline).map(plugin => {
        return plugin.pipeline({ mode, cwd, sourcemaps, cache });
      })
    );
    const transform = steps.length ? pipe(...steps) : files => files;
    profile.timeEnd('load plugins');

    let livereload;
    if (server) {
      const livereloadClient = require('connect-livereload');
      const livereloadServer = require('tiny-lr');

      const { host } = config;
      const port = await findPort(host, 35729);
      const middleware = livereloadClient({ port });
      const lr = livereloadServer();

      livereload = { port, middleware, server: lr };

      const listen = () => {
        lr.listen(port, host, () => {
          debug(`livereload listening on http://${host}:${port}/`);
        });
      };

      server.use(middleware);
      if (server.listening) {
        listen();
      } else {
        server.on('listening', listen);
      }
    }

    const build = async () => {
      const start = process.hrtime();
      task.status('Building...');

      try {
        const files = await input.files();
        const transformed = await transform(files);

        output.update(transformed);

        const result = {
          elapsed: process.hrtime(start),
          write: () => output.write(sourcemaps),
          output
        };

        task.status(
          `Done. (${formatTime(result.elapsed)}${
            watch ? ', waiting for changes' : ''
          })`
        );
        debug(`${formatTime(result.elapsed)}`);
        task.result(result);

        // TEMP
        await result.write();
      } catch (err) {
        task.status(chalk`{redBright ERROR}`);
        console.error(err);
      }
    };

    await build();
    task.ready = true;

    if (!watch) return;

    if (livereload) {
      livereload.server.changed({ params: { files: getChanged(output) } });
    }

    const rebuild = debounce(async () => {
      await build();

      if (livereload) {
        const files = getChanged(output);
        debug(`livereload: ${files}`);
        livereload.server.changed({ params: { files } });
      }
    }, 100);
    const subscription = input.watch(rebuild);

    await task.closed;

    subscription.unsubscribe();
    livereload && livereload.server.close();
    debug('closed watcher and livereload');
    task.status('Closed.');
  }
});

exports.branch = require('./lib/branch');
exports.bundle = require('./lib/bundle');
exports.map = require('./lib/map');
exports.skip = require('./lib/skip');
exports.File = require('./lib/file');
exports.Files = require('./lib/files');

const { applySourceMap, removeSourceMapComments } = require('./lib/sourcemaps');
exports.applySourceMap = applySourceMap;
exports.removeSourceMapComments = removeSourceMapComments;

function getChanged(output) {
  const { modified, added, removed } = output.changes;
  const files = modified
    .concat(added)
    .concat(removed)
    .filter(file => !file.endsWith('.map'));

  return files;
}
