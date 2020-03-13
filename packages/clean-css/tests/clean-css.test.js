const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const cleanCss = require('../')({});
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await cleanCss.pipeline({
    cwd,
    cache: false,
    sourcemaps: true,
    mode: 'production'
  });
  const files = await Files.from('**/*', { cwd });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
