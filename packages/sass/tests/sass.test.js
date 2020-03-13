const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const sass = require('../')();
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await sass.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*.{scss,sass}', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
