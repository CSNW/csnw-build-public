const { Files } = require('../packages/pipeline');

module.exports = {
  print(files, serialize) {
    const snapshot = {};
    for (const file of files) {
      snapshot[file.relative] = {
        cwd: file.cwd,
        baseDir: file.baseDir,
        path: file.path,
        contents: file.contents && file.contents.toString(),
        sourceMap: file.sourceMap
      };
    }

    return serialize(snapshot);
  },
  test(value) {
    return Files.isFiles(value);
  }
};
