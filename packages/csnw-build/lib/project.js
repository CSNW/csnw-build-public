const debug = require('debug')('csnw-build:project');
const EventEmitter = require('events');
const connect = require('connect');
const { removeSync } = require('fs-extra');
const { Task, Profiler } = require('@csnw-build/utils');
const loadConfig = require('./config');

const profile = new Profiler(debug);

module.exports = class Project extends EventEmitter {
  constructor(config) {
    super();

    this.config = config;
    this.tasks = [];
    this.server = connect();
  }

  async run(steps, args) {
    await Promise.all(
      steps.map(step => {
        const task = new Task(step.name);
        this.tasks.push(task);
        this.emit('add', task);

        debug(`starting "${step.name}"`);
        return step.run(this.config, args, task);
      })
    );
  }

  async dev(args = {}) {
    const open = args.open;

    args = Object.assign(
      {
        mode: 'development',
        cache: true,
        watch: true,
        cwd: process.cwd()
      },
      args,
      {
        // Handle open here to wait until build is successful
        open: false,
        server: this.server
      }
    );

    const building = this.build(args);
    const checking = this.check(args);

    // Wait until other tasks are ready to start serve and open
    // (gives a chance for tasks to register middleware before plugins)
    await allReady(this.tasks);

    const serving = this.serve(args);
    const opening = open && allReady(this.tasks).then(() => this.open());

    await Promise.all([building, checking, serving, opening]);
  }

  async build(args = {}) {
    args = Object.assign(
      {
        mode: 'production',
        cache: false,
        watch: false,
        cwd: process.cwd()
      },
      args
    );

    removeSync(this.config.dest);
    await this.run(this.config.build, args);
  }

  async check(args = {}) {
    args = Object.assign({ watch: false, cwd: process.cwd() }, args);

    await this.run(this.config.check, args);
  }

  async test(args = {}) {
    args = Object.assign({ watch: false, cwd: process.cwd() }, args);

    await this.run(this.config.test, args);
  }

  async deploy(args = {}) {
    args = Object.assign({ cwd: process.cwd() }, args);

    await this.run(this.config.deploy, args);
  }

  async serve(args = {}) {
    args = Object.assign({}, args, { server: this.server });

    const serving = this.run(this.config.serve, args);
    const opening =
      args.open && all(this.tasks, 'ready').then(() => this.open());

    await Promise.all([serving, opening]);
  }

  async open() {
    const { target, https, host, port } = this.config;
    if (target && target.open) {
      const url = `${https ? 'https' : 'http'}://${host}:${port}`;
      await this.config.target.open(url);
    }
  }

  close() {
    for (const task of this.tasks) {
      try {
        task.close();
      } catch (err) {}
    }
    debug('closed');
  }

  static async load(args) {
    const config = await loadConfig(args);
    return new Project(config);
  }
};

async function allReady(tasks) {
  return new Promise(resolve => {
    let count = tasks.length;
    const callback = () => {
      if (--count === 0) resolve();
    };

    for (const task of tasks) {
      if (task.ready) {
        callback();
      } else {
        task.once('ready', callback);
      }
    }
  });
}
