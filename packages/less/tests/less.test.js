const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const less = require('../')();
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await less.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*.less', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
