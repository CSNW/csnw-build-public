const Project = require('../lib/project');
const { formatTime } = require('@csnw-build/utils');

const usage = `
Test project

Usage: csnw-build test`;

module.exports = async function dev(args) {
  if (args.help) {
    console.log(usage);
    return;
  }

  const start = process.hrtime();

  const project = await Project.load(args);
  await project.test(args);

  console.log(`\nDone. (${formatTime(process.hrtime(start))})`);
};
