const Project = require('../lib/project');
const { formatTime } = require('@csnw-build/utils');

const usage = `
Check project for build errors / warnings

Usage: csnw-build check`;

module.exports = async function dev(args) {
  if (args.help) {
    console.log(usage);
    return;
  }

  const start = process.hrtime();

  const project = await Project.load(args);
  await project.check(args);

  console.log(`\nDone. (${formatTime(process.hrtime(start))})`);
};
