const Project = require('../lib/project');
const { formatTime } = require('@csnw-build/utils');

const usage = `
Deploy project

Usage: csnw-build deploy [options]

Options:
  --dry-run   Prepare project for deployment without finalizing`;

module.exports = async function dev(args) {
  if (args.help) {
    console.log(usage);
    return;
  }

  const start = process.hrtime();

  const project = await Project.load(args);
  await project.deploy(args);

  console.log(`\nDone. (${formatTime(process.hrtime(start))})`);
};
