const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const move = require('../')('*.js', 'moved');
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await move.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
