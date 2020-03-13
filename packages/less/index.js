const debug = require('debug')('csnw-build:less');
const { dirname } = require('path');
const {
  Profiler,
  unixPath,
  unixJoin,
  requirePeer
} = require('@csnw-build/utils');

module.exports = (options = {}) => {
  const { src = ['**/*.less'], entry: entries = ['!**/_*.less'] } = options;
  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/less',

    async pipeline({ cwd, sourcemaps, cache }) {
      const {
        branch,
        bundle,
        applySourceMap
      } = require('@csnw-build/pipeline');

      const less = await requirePeer('less', cwd);

      const file_manager = createFileManager(less);
      less.environment.fileManagers[0] = file_manager;

      return branch(
        { profile, cache },
        bundle({ entries, profile, cache }, async (entry, files) => {
          file_manager.__setFiles(files);

          return new Promise((resolve, reject) => {
            less.render(
              entry.contents.toString(),
              {
                filename: entry.relative,
                paths: [dirname(entry.path)],
                sourceMap: sourcemaps ? { outputSourceFiles: true } : false
              },
              async (err, output) => {
                if (err) return reject(err);

                entry.ext = '.css';
                entry.contents = output.css;

                if (sourcemaps) {
                  await applySourceMap(entry, output.map);
                }

                resolve({ bundle: entry, dependencies: output.imports });
              }
            );
          });
        })
      );
    }
  };
};

function createFileManager(less) {
  class PipelineFileManager extends less.FileManager {
    __setFiles(files) {
      if (!this.__files) this.__files = new Map();

      for (const file of files) {
        this.__files.set(file.path, file);
      }
    }

    loadFile(filename, currentDirectory, options, environment, callback) {
      const resolved = unixJoin(options.paths[0], `${filename}.less`);
      const file = this.__files.get(resolved);

      if (!file) {
        return super.loadFile(
          filename,
          currentDirectory,
          options,
          environment,
          callback
        );
      }

      const result = {
        contents: file.contents.toString(),
        filename: file.path
      };
      if (options.syncImport && callback) {
        callback(null, result);
      } else if (options.syncImport) {
        return result;
      } else {
        return Promise.resolve(result);
      }
    }
  }

  return new PipelineFileManager();
}
