const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const uglify = require('../')();
const cwd = join(__dirname, 'fixtures');

test('skip pipeline in development', async () => {
  const process = await uglify.pipeline({
    mode: 'development',
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});

test('pipeline', async () => {
  const process = await uglify.pipeline({
    mode: 'production',
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
