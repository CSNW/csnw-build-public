const { join } = require('path');
const File = require('./file');

module.exports = class Files {
  constructor(files) {
    this.files = new Set(files);
  }

  [Symbol.iterator]() {
    return this.files.values();
  }

  get size() {
    return this.files.size;
  }
  add(file) {
    this.files.add(file);
  }
  remove(file) {
    this.files.delete(file);
  }

  map(iterator) {
    const mapped = [];
    for (const file of this.files) {
      mapped.push(iterator(file));
    }
    return mapped;
  }
  filter(iterator) {
    const filtered = [];
    for (const file of this.files) {
      if (iterator(file)) {
        filtered.push(file);
      }
    }
    return new Files(filtered);
  }

  snapshot() {
    const result = new Map();
    for (const file of this.files) {
      result.set(file.path, file.hash);
    }
    return result;
  }

  toMap() {
    const result = new Map();
    for (const file of this.files) {
      result.set(file.path, file);
    }
    return result;
  }

  clone() {
    const result = new Files();
    for (const file of this.files) {
      result.add(file.clone());
    }
    return result;
  }

  static async from(patterns, options = {}) {
    const expandGlobs = require('./expand-globs');

    const { cwd = process.cwd() } = options;
    const paths = await expandGlobs(patterns, { cwd, nodir: true });

    const loading = paths.map(async ({ baseDir, path }) => {
      baseDir = options.baseDir != null ? options.baseDir : baseDir;
      const file = new File({ cwd, baseDir, path });

      await file.read();

      return file;
    });
    const files = await Promise.all(loading);

    return new Files(files);
  }

  static compare(files, reference = new Map()) {
    if (files.snapshot) files = files.snapshot();
    if (reference.snapshot) reference = reference.snapshot();

    const added = [];
    const modified = [];
    const removed = [];

    for (const [path, hash] of files) {
      if (!reference.has(path)) added.push(path);
      else if (hash !== reference.get(path)) modified.push(path);
    }
    for (const path of reference.keys()) {
      if (!files.has(path)) removed.push(path);
    }

    const size = added.length + modified.length + removed.length;

    return { added, modified, removed, size };
  }

  static merge(original, ...values) {
    const merged = Array.from(original.files);
    for (const group of values) {
      for (const file of group) {
        merged.push(file);
      }
    }
    return new Files(merged);
  }

  static isFiles(value) {
    return !!(value && value.files && typeof value.snapshot === 'function');
  }
};
