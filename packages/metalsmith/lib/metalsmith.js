const { resolve } = require('path');
const Ware = require('ware');

const unimplemented = name =>
  new Error(`"${name}" is not implemented by metalsmith plugin for pipeline.`);

module.exports = class Metalsmith extends Ware {
  constructor(options = {}) {
    super();

    this._cwd = options.cwd;
    this._metadata = {};
  }

  metadata(value) {
    if (!arguments.length) return this._metadata;

    this._metadata = Object.assign({}, value);
    return this;
  }

  path(...paths) {
    if (this._cwd && this._cwd !== process.cwd()) {
      paths.unshift(this._cwd);
    }

    return resolve(...paths);
  }

  build() {
    throw unimplemented('build');
  }
  source() {
    throw unimplemented('source');
  }
  destination() {
    throw unimplemented('destination');
  }
  clean() {
    throw unimplemented('clean');
  }
  frontmatter() {
    throw unimplemented('frontmatter');
  }
  read() {
    throw unimplemented('read');
  }
  readFile() {
    throw unimplemented('readFile');
  }
  write() {
    throw unimplemented('write');
  }
  writeFile() {
    throw unimplemented('writeFile');
  }
};
