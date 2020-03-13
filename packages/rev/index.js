const debug = require('debug')('csnw-build:rev');
const { relative, join, dirname } = require('path');
const {
  Profiler,
  matcher,
  toArray,
  md5,
  unixJoin,
  unixPath
} = require('@csnw-build/utils');

const may_have_relative = ['.css'];

module.exports = (options = {}) => {
  const {
    rev = '**/*.{js,css,png,jpg,jpeg,gif,svg,eot,ttf,woff,woff2}',
    replace = '**/*.{js,css,html,hbs}'
  } = options;
  const src = [...toArray(rev), ...toArray(replace)];
  const profile = new Profiler(debug);

  return {
    name: '@csnw-build/rev',
    pipeline({ mode, cwd, cache, sourcemaps }) {
      const {
        branch,
        File,
        applySourceMap,
        skip
      } = require('@csnw-build/pipeline');
      const MagicString = require('magic-string');
      const isAsset = matcher(rev);
      const isTarget = matcher(replace);

      if (mode !== 'production') return skip({ profile });

      return branch({ src, cache, profile }, async files => {
        // 1. Identify files that need rev/replace (assets and targets)
        const assets = new Map();
        const targets = new Map();

        for (const file of files) {
          if (file.matches(isAsset)) {
            assets.set(file.relative, file);
          }
          if (file.matches(isTarget)) {
            const contents = file.contents.toString();
            const matches = [];
            const paths = new Set();

            targets.set(file.relative, { file, contents, matches, paths });
          }
        }

        // 2. Identify dependencies of targets
        for (const target of targets.values()) {
          for (const path of assets.keys()) {
            const regex = new RegExp(`${path}(?:(?![a-zA-Z\\d\\s]))`, 'g');

            let matches = 0;
            let match;
            while ((match = regex.exec(target.contents)) !== null) {
              const start = match.index;
              const end = start + match[0].length;
              target.matches.push({ start, end, path });
              target.paths.add(path);
              matches++;
            }

            if (!matches && may_have_relative.includes(target.file.ext)) {
              const relative_path = unixPath(
                relative(
                  dirname(target.file.path),
                  join(target.file.baseDir, path)
                )
              );
              if (relative_path.startsWith('../')) continue;

              const relative_regex = new RegExp(
                `${relative_path}(?:(?![a-zA-Z\\d\\s]))`,
                'g'
              );

              let match;
              while ((match = relative_regex.exec(target.contents)) !== null) {
                const start = match.index;
                const end = start + match[0].length;
                target.matches.push({ start, end, path, relative: true });
                target.paths.add(path);
              }
            }
          }
        }

        // 3. Perform rev and replace operations
        const manifest = {};
        const operations = Array.from(
          new Set([...Array.from(assets.keys()), ...Array.from(targets.keys())])
        );

        const overflow = operations.length * 10;
        let count = 0;
        while (operations.length && count < overflow) {
          count += 1;
          const path = operations.shift();
          const asset = assets.get(path);
          const target = targets.get(path);
          const file = target ? target.file : asset;

          if (target) {
            let ready = true;
            for (const dependency of target.paths) {
              if (!manifest[dependency]) {
                // Dependency hasn't been processed yet, move to end of line
                operations.push(path);
                ready = false;
                break;
              }
            }
            if (!ready) continue;

            // (replace in reverse to avoid shifting positions)
            const replaced = new MagicString(target.contents);
            for (const match of target.matches.reverse()) {
              const replacement = !match.relative
                ? manifest[match.path]
                : unixPath(
                    relative(
                      target.file.dir,
                      join(target.file.baseDir, manifest[match.path])
                    )
                  );

              replaced.overwrite(match.start, match.end, replacement);
            }

            file.contents = replaced.toString();

            // Assumption: only assets need sourcemaps
            // (avoids adding sourcemap to html)
            if (sourcemaps && asset) {
              const map = replaced.generateMap({
                source: file.relative,
                file: file.relative,
                includeContent: true
              });
              await applySourceMap(file, map);
            }
          }

          if (!assets.has(path)) continue;

          const hash = md5(assets.get(path).contents).slice(0, 10);
          file.name = `${file.name}-${hash}`;
          manifest[path] = file.relative;
        }
        if (operations.length) {
          throw new Error(
            `rev failed due to dependency cycles between ${operations}`
          );
        }

        // 5. Write manifest.json to output
        files.add(
          new File({
            cwd,
            path: unixJoin(cwd, 'manifest.json'),
            contents: JSON.stringify(manifest, null, 2)
          })
        );

        return files;
      });
    }
  };
};
