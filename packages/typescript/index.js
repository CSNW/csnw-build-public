const debug = require('debug')('csnw-build:typescript');
const { join, dirname, resolve, relative } = require('path');
const { existsSync } = require('fs');
const { Profiler, requirePeer } = require('@csnw-build/utils');

module.exports = (options = {}) => {
  const { src = ['**/*.{ts,tsx}'] } = options;
  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/typescript',

    async pipeline({ cwd, sourcemaps, cache }) {
      const {
        branch,
        map,
        applySourceMap,
        removeSourceMapComments
      } = require('@csnw-build/pipeline');
      const tsc = await requirePeer('typescript', cwd);

      const compilerOptions = loadCompilerOptions(tsc, { cwd, sourcemaps });
      const preserveJsx = compilerOptions.jsx === 1;

      return branch(
        { src, profile, cache },
        map({ profile, cache }, async file => {
          const { outputText, sourceMapText } = tsc.transpileModule(
            file.contents.toString(),
            { compilerOptions, fileName: file.base }
          );

          file.ext = file.ext === '.tsx' && preserveJsx ? '.jsx' : '.js';
          file.contents = Buffer.from(removeSourceMapComments(outputText));

          if (sourcemaps) {
            await applySourceMap(file, sourceMapText);
          }

          return file;
        })
      );
    }
  };
};

function loadCompilerOptions(tsc, options = {}) {
  const { cwd = process.cwd(), sourcemaps = true } = options;

  // Load and parse options
  const tsconfigPath = join(cwd, 'tsconfig.json');
  if (!existsSync(tsconfigPath)) {
    throw new Error(`No tsconfig.json found at "${tsconfigPath}"`);
  }

  const loaded = tsc.readConfigFile(tsconfigPath, tsc.sys.readFile);
  if (loaded.error) {
    throw new Error(`Failed to load tsconfig.json:\n\n${loaded.error}`);
  }

  // Explicitly set source map options
  const compilerOptions = loaded.config.compilerOptions;
  compilerOptions.suppressOutputPathCheck = true;
  compilerOptions.sourceRoot = undefined;
  compilerOptions.inlineSources = true;
  compilerOptions.sourceMap = !!sourcemaps;
  compilerOptions.inlineSourceMap = false;

  return compilerOptions;
}
