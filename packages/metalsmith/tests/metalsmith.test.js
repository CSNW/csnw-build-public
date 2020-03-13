const { join } = require('path');
const { Files } = require('@csnw-build/pipeline');

const metalsmith = require('../')({
  layouts: './src/layouts',
  partials: './src/partials'
});
const cwd = join(__dirname, 'fixtures');

test('pipeline', async () => {
  const process = await metalsmith.pipeline({
    cwd,
    cache: false
  });
  const files = await Files.from('**/*', { cwd, baseDir: join(cwd, 'src') });

  const result = await process(files);
  expect(result).toMatchSnapshot();
});
