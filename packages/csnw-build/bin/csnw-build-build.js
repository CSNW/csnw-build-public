const Project = require('../lib/project');
const { formatTime } = require('@csnw-build/utils');

const usage = `
Build project for production

Usage: csnw-build build [options]

Options:
  --mode    Build mode, production or development [default: production]
  --watch   Watch src files and rebuild on change`;

module.exports = async args => {
  if (args.help) {
    console.log(usage);
    return;
  }

  const start = process.hrtime();

  const project = await Project.load(args);
  await project.build(args);

  console.log(`\nDone. (${formatTime(process.hrtime(start))})`);
};
