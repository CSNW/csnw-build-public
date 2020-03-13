const { join } = require('path');
const { remove } = require('fs-extra');
const Files = require('./files');

module.exports = class Output {
  constructor(dest) {
    this.dest = dest;

    this.files = new Map();
    this.cache = new Map();
    this.changes = Files.compare(this.files, this.cache);
  }

  has(path) {
    return this.files.has(path);
  }
  get(path) {
    return this.files.get(path);
  }

  update(files) {
    this.files = new Map();
    for (const file of files) {
      file.path = join(file.cwd, this.dest, file.relative);
      this.files.set(file.path, file);
    }

    this.changes = Files.compare(files, this.cache);
    this.cache = files.snapshot();
  }

  async write(sourcemaps) {
    const waiting = [];
    for (const path of this.changes.added) {
      const file = this.files.get(path);
      waiting.push(file.write(sourcemaps));
    }
    for (const path of this.changes.modified) {
      const file = this.files.get(path);
      waiting.push(file.write(sourcemaps));
    }
    for (const path of this.changes.removed) {
      waiting.push(remove(path));
    }

    await Promise.all(waiting);
  }
};
