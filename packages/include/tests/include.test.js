const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const cwd = join(__dirname, 'fixtures');
const include = require('../')('nested/b.js', { cwd, baseDir: cwd });

test('pipeline', async () => {
  const process = await include.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('a.js', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
