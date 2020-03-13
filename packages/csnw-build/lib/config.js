const debug = require('debug')('csnw-build:config');
const { join } = require('path');
const { exists } = require('fs-extra');
const {
  Profiler,
  choosePort,
  toArray,
  findPort
} = require('@csnw-build/utils');
const CliError = require('./utils/cli-error');

const profile = new Profiler(debug);

const default_host = 'localhost';
const default_port = 8080;

module.exports = async function loadConfig(args = {}) {
  const { cwd = process.cwd() } = args;

  const path = join(cwd, 'csnw.config.js');
  let config = {};
  if (await exists(path)) {
    profile.time('load config (project)');

    try {
      delete require.cache[path];
      config = require(path);
    } catch (err) {
      throw new CliError(`Failed to load configuration from "${path}"`, {
        original: err
      });
    }

    debug(`Loaded config from "${path}"`);
    profile.timeEnd('load config (project)');
  } else {
    // For no configuration, just use defaults
    debug(`No configuration found at "${path}", using defaults`);
  }

  // Load defaults and standardize shape
  profile.time('load config (prepare)');
  config = Object.assign(
    {
      // src: src/**/*, only set if no entry
      // entry: only user-defined
      dest: 'build',
      sourcemaps: '.',
      use: [],
      // build: only load if none defined
      // check: only load if none defined
      // serve: only load if none defined
      test: [],
      deploy: [],

      https: false,
      host: default_host
    },
    config
  );

  if (!config.src && !config.entry) {
    config.src = 'src/**/*';
  }

  if (!config.build) {
    config.build = [];
    if (config.src) {
      const pipeline = require('@csnw-build/pipeline');
      config.build.push(pipeline());
    }
    if (config.entry) {
      // TODO webpack
    }
  }
  if (!config.check) {
    // TODO check
    config.check = [];
  }
  if (!config.serve) {
    const serve = require('./serve');
    config.serve = [serve()];
  }

  // Ensure plugins and tasks are arrays and allow async plugins and tasks
  config.use = await Promise.all(toArray(config.use));
  config.build = await Promise.all(toArray(config.build));
  config.check = await Promise.all(toArray(config.check));
  config.serve = await Promise.all(toArray(config.serve));
  config.test = await Promise.all(toArray(config.test));
  config.deploy = await Promise.all(toArray(config.deploy));

  // Override and prepare values for https, host, and port
  // Precedence = args -> env -> config -> defaults
  config.https =
    'https' in args
      ? args.https
      : 'HTTPS' in process.env ? Boolean(process.env.HTTPS) : config.https;
  config.host = args.host || process.env.HOST || config.host;
  config.port =
    args.port ||
    process.env.PORT ||
    config.port ||
    (await findPort(config.host, default_port));

  profile.timeEnd('load config (prepare)');

  return config;
};
