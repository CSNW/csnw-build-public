const assert = require('assert');
const {
  relative: _relative,
  join,
  dirname,
  basename,
  extname
} = require('path');
const {
  unixPath,
  removeTrailing,
  md5,
  isFunction
} = require('@csnw-build/utils');

const relative = (from, to) => unixPath(_relative(from, to));

module.exports = class File {
  constructor(values = {}) {
    const {
      cwd = process.cwd(),
      baseDir = null,
      path = null,
      contents = null
    } = values;

    this._cwd = null;
    this._baseDir = null;
    this._path = null;
    this._contents = null;
    this._hash = null;

    this._sourceMap = null;

    this.path = path;
    this.cwd = cwd;
    this.baseDir = baseDir;
    this.contents = contents;
  }

  get cwd() {
    return this._cwd;
  }
  set cwd(value) {
    assert(
      value && typeof value === 'string',
      'File.cwd must be a non-empty string'
    );
    this._cwd = removeTrailing(unixPath(value));
  }

  get baseDir() {
    return this._baseDir || this._cwd;
  }
  set baseDir(value) {
    if (value == null) {
      this._baseDir = null;
      return;
    }

    assert(
      value && typeof value === 'string',
      'File.baseDir must be a non-empty string or null/undefined'
    );
    value = removeTrailing(unixPath(value));

    if (value !== this._cwd) {
      this._baseDir = value;
    } else {
      this._baseDir = null;
    }
  }

  get relative() {
    assert(this.path, 'File.path is not set, cannot determine File.relative');
    return relative(this.baseDir, this.path);
  }
  set relative(_) {
    throw new Error(
      'File.relative is generated from the baseDir and path attributes and cannot be set directly'
    );
  }

  get dir() {
    assert(this.path, 'File.path is not set, cannot determine File.dir');
    return unixPath(dirname(this.path));
  }
  set dir(value) {
    assert(this.path, 'File.path is not set, cannot set File.dir');
    this.path = join(unixPath(value), this.base);
  }

  get base() {
    assert(this.path, 'File.path is not set, cannot determine File.base');
    return basename(this.path);
  }
  set base(value) {
    assert(this.path, 'File.path is not set, cannot set File.base');
    this.path = join(this.dir, value);
  }

  get name() {
    assert(this.path, 'File.path is not set, cannot determine File.name');
    return basename(this.path, this.ext);
  }
  set name(value) {
    assert(this.path, 'File.path is not set, cannot set File.name');
    this.path = join(this.dir, value + this.ext);
  }

  get ext() {
    assert(this.path, 'File.path is not set, cannot determine File.ext');
    return extname(this.path);
  }
  set ext(value) {
    assert(this.path, 'File.path is not set, cannot set File.ext');
    this.path = join(this.dir, this.name + value);
  }

  get path() {
    return this._path;
  }
  set path(value) {
    this._path = value ? unixPath(value) : null;
  }

  get contents() {
    return this._contents;
  }
  set contents(value) {
    assert(
      !Buffer.isBuffer(value) || typeof value === 'string' || value !== null,
      'File.data can only be a Buffer, string, or null'
    );
    if (typeof value === 'string') value = Buffer.from(value);

    this._contents = value;
    this._hash = null;
  }

  get sourceMap() {
    return this._sourceMap;
  }
  set sourceMap(value) {
    throw new Error(
      'Directly setting sourceMap is not supported, use applySourceMap instead'
    );
  }

  get hash() {
    if (this._hash === null && this.contents) {
      this._hash = md5(this.contents);
    }

    return this._hash;
  }

  matches(pattern) {
    const path = relative(this.cwd, this.path);
    if (isFunction(pattern)) return pattern(path);

    const { isMatch } = require('@csnw-build/utils');
    return isMatch(path, pattern);
  }

  async read(options = {}) {
    const { readFile } = require('fs-extra');
    const { loadSourceMap } = require('./sourcemaps');

    let contents = await readFile(this.path);

    if (options.loadSourceMap) {
      await loadSourceMap(this);
    }

    this.contents = contents;
  }

  async write(sourcemaps = '.') {
    const { outputFile } = require('fs-extra');
    const {
      prepareInlineSourceMap,
      prepareExternalSourceMap
    } = require('./sourcemaps');

    if (!sourcemaps || !this.sourceMap) {
      await outputFile(this.path, this.contents);
    } else if (sourcemaps === true) {
      // inline sourcemap
      const contents = prepareInlineSourceMap(this);
      await outputFile(this.path, contents);
    } else {
      // external sourcemap
      const { contents, sourceMap } = prepareExternalSourceMap(
        this,
        sourcemaps
      );

      await Promise.all([
        outputFile(this.path, contents),
        outputFile(sourceMap.path, sourceMap.contents)
      ]);
    }
  }

  clone() {
    const file = new File({
      cwd: this.cwd,
      baseDir: this.baseDir,
      path: this.path,
      contents: this.contents
    });
    file._sourceMap = this.sourceMap;
    file._hash = this._hash;

    return file;
  }

  inspect() {
    return `<File path="${
      this.path ? this.relative : null
    }" contents="${this.contents.toString().slice(0, 25)}...">`;
  }
};
