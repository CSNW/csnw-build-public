const EventEmitter = require('events');
const deferred = require('./deferred');

module.exports = class Task extends EventEmitter {
  constructor(name = 'Unknown Task') {
    super();

    this.name = name;
    this.closed = deferred();
    this.ready = false;
  }

  status(message) {
    this.emit('status', message);
  }
  result(result) {
    this.emit('result', result);
  }

  get ready() {
    return this._ready;
  }
  set ready(value) {
    this._ready = Boolean(value);
    if (this._ready) this.emit('ready');
  }

  clear() {
    this.emit('clear');
  }
  log(...message) {
    this.emit('log', message);
  }
  warning(...warning) {
    this.emit('warning', warning);
  }
  error(...error) {
    this.emit('error', error);
  }

  close() {
    this.closed.resolve();
  }
};
