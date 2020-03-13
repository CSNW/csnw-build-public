const debug = require('debug')('csnw-build:input');
const { join } = require('path');
const File = require('./file');
const Files = require('./files');
const { toArray, unixPath } = require('@csnw-build/utils');

module.exports = class Input {
  constructor(patterns, options = {}) {
    const { cwd = process.cwd() } = options;

    this.patterns = toArray(patterns);
    this.cwd = cwd;
    this.changes = [];

    this._files = null;
  }

  async files() {
    if (this._files === null) {
      this._files = await Files.from(this.patterns, { cwd: this.cwd });

      // Pre-compute hash for initial load (helps with branch/snapshot performance)
      for (const file of this._files) {
        file.hash;
      }
    }
    if (this.changes.length) {
      const changes = this.changes.slice();
      this.changes = [];

      const byPath = new Map();
      for (const file of this._files) {
        byPath.set(file.path, file);
      }

      debug(`changed ${changes.map(change => change.path).join(', ')}`);

      // For add, re-expand globs to get baseDir for added
      let baseDirs = {};
      if (changes.some(change => change.type === 'add')) {
        const expandGlobs = require('./expand-globs');
        const expanded = await expandGlobs(this.patterns, {
          cwd: this.cwd,
          nodir: true
        });
        expanded.forEach(
          ({ baseDir, path }) => (baseDirs[unixPath(path)] = unixPath(baseDir))
        );
      }

      for (const change of changes) {
        const path = unixPath(join(this.cwd, change.path));

        if (change.type === 'add') {
          const baseDir = baseDirs[path];
          const file = new File({ cwd: this.cwd, baseDir, path });
          await file.read();

          this._files.add(file);
        } else if (change.type === 'remove') {
          const file = byPath.get(path);
          this._files.remove(file);
        } else if (change.type === 'change') {
          const file = byPath.get(path);
          await file.read();
        }
      }
    }

    return this._files.clone();
  }

  watch(callback) {
    const chokidar = require('chokidar');
    const watcher = chokidar.watch(this.patterns);
    let ready = false;

    watcher.on('all', (event, path) => {
      if (!ready) return;

      this.changes.push({ type: event, path });
      callback();
    });
    watcher.on('ready', () => {
      ready = true;
    });

    const unsubscribe = () => watcher.close();
    return { unsubscribe };
  }
};
