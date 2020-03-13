const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const babel = require('../')({ src: '*.{js,ts}' });
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await babel.pipeline({
    cwd,
    sourcemaps: true,
    cache: false
  });
  const files = await Files.from('*.{js,ts}', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
