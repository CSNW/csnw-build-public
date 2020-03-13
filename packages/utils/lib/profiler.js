const formatTime = require('./format-time');

module.exports = class Profiler {
  constructor(debug) {
    this.debug = debug;
    this.timers = {};

    this.matching = 0;
    this.processed = 0;
    this.cached = 0;
    this.skipped = false;
  }

  time(name) {
    this.timers[name] = process.hrtime();
  }
  timeEnd(name) {
    if (!this.timers[name]) {
      return this.debug(`WARNING timer "${name}" not found`);
    }

    this.debug(`${name} - ${formatTime(process.hrtime(this.timers[name]))}`);
    delete this.timers[name];
  }

  start() {
    this._start = process.hrtime();
    this.matching = 0;
    this.processed = 0;
    this.cached = 0;
    this.skipped = false;

    return this;
  }
  done() {
    const elapsed = this._start
      ? formatTime(process.hrtime(this._start))
      : '0 ms';
    const { skipped, processed, cached, matching } = this;

    if (skipped || (!processed && !matching)) {
      this.debug(`${elapsed} (skipped)`);
    } else if (processed) {
      this.debug(
        `${elapsed} (${processed} processed, ${cached} cached, ${matching} matching)`
      );
    } else {
      this.debug(`${elapsed} (${matching} matching)`);
    }
  }
};
