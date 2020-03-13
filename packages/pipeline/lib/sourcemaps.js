const debug = require('debug')('csnw-build:sourcemaps');
const assert = require('assert');
const { resolve, relative, dirname, join } = require('path');
const { readFile } = require('fs-extra');
const convertSourceMap = require('convert-source-map');
const detectNewline = require('detect-newline');
const { SourceMapGenerator, SourceMapConsumer } = require('source-map');
const { unixPath, unixJoin, isString } = require('@csnw-build/utils');
const File = require('./file');

const URL_REGEX = /^(https?|webpack(-[^:]+)?):\/\//;

async function applySourceMap(file, sourceMap) {
  if (isString(sourceMap) || Buffer.isBuffer(sourceMap)) {
    sourceMap = JSON.parse(sourceMap);
  }
  if (sourceMap.toJSON) {
    sourceMap = sourceMap.toJSON();
  }
  if (file.sourceMap && isString(file.sourceMap)) {
    file._sourceMap = JSON.parse(file.sourceMap);
  }

  assert(
    sourceMap.hasOwnProperty('mappings'),
    'Source map is missing mappings'
  );
  assert(sourceMap.hasOwnProperty('sources'), 'Source map is missing sources');

  // Load sources using file directory and sourceRoot (if specified)
  const sources = sourceMap.sources.map(source => {
    return unixPath(resolve(file.baseDir, sourceMap.sourceRoot || '.', source));
  });

  const sourcesContent = await Promise.all(
    sources.map(async (source, index) => {
      let sourceContent =
        sourceMap.sourcesContent && sourceMap.sourcesContent[index];

      if (sourceContent) return sourceContent;
      if (source.match(URL_REGEX)) return null;
      if (source === file.path) return file.contents;

      debug(`reading ${source}`);
      return readFile(source);
    })
  );

  sourceMap.file = file.relative;
  sourceMap.sources = sources.map(source =>
    unixPath(relative(file.baseDir, source))
  );
  sourceMap.sourcesContent = sourcesContent;
  sourceMap.sourceRoot = null;

  if (file.sourceMap && file.sourceMap.mappings !== '') {
    const [existing, updated] = await Promise.all([
      new SourceMapConsumer(sourceMap),
      new SourceMapConsumer(file.sourceMap)
    ]);

    const generator = SourceMapGenerator.fromSourceMap(existing);
    generator.applySourceMap(updated);
    sourceMap = generator.toJSON();

    existing.destroy();
    updated.destroy();
  }

  // Explicitly follow SourceMapGenerator's ordering
  file._sourceMap = {
    version: sourceMap.version,
    sources: sourceMap.sources,
    names: sourceMap.names,
    mappings: sourceMap.mappings,
    file: sourceMap.file,
    sourcesContent: sourceMap.sourcesContent
  };
}

async function loadSourceMap(file) {
  if (!file.contents) return null;

  const contents = file.contents.toString();

  let sourceMap = loadInlineSourceMap(file, contents);
  if (!result) sourceMap = await loadExternalSourceMap(file, contents);
  if (!result) return;

  await applySourceMap(file, sourceMap);
}

function loadInlineSourceMap(file, contents) {
  const sourceMap = convertSourceMap.fromSource(contents);
  if (!sourceMap) return;

  return sourceMap.toObject();
}

async function loadExternalSourceMap(file, contents) {
  const comment = convertSourceMap.mapFileCommentRegex.exec(contents);
  if (!comment) return;

  const mapFile = resolve(file.dir, comment[1] || comment[2]);
  const dir = dirname(mapFile);

  const sourceMap = JSON.parse(await readFile(mapFile));
  sourceMap.sources = sourceMap.sources.map(source => resolve(dir, source));

  return sourceMap;
}

function prepareInlineSourceMap(file) {
  const contents = file.contents.toString();
  if (!file.sourceMap) return contents;

  const newline = detectNewline.graceful(contents);
  const comment = convertSourceMap
    .fromObject(file.sourceMap)
    .toComment({ multiline: file.ext === '.css' });

  return contents + newline + comment;
}

function prepareExternalSourceMap(file, dest = '.') {
  const contents = file.contents.toString();
  if (!file.sourceMap) return { contents, sourceMap: null };

  const path = unixJoin(file.dir, dest, file.base + '.map');
  const rel_path = unixPath(relative(file.dir, path));

  const newline = detectNewline.graceful(contents);
  const comment = convertSourceMap.generateMapFileComment(rel_path, {
    multiline: file.ext === '.css'
  });

  const sourceMap = new File({
    cwd: file.cwd,
    baseDir: file.baseDir,
    path,
    contents: JSON.stringify(file.sourceMap)
  });

  return {
    contents: contents + newline + comment,
    sourceMap
  };
}

function removeSourceMapComments(contents) {
  return convertSourceMap.removeMapFileComments(
    convertSourceMap.removeComments(contents)
  );
}

module.exports = {
  applySourceMap,
  loadSourceMap,
  loadInlineSourceMap,
  loadExternalSourceMap,
  prepareInlineSourceMap,
  prepareExternalSourceMap,
  removeSourceMapComments
};
