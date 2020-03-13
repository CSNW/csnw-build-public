const Project = require('../lib/project');
const { deferred } = require('@csnw-build/utils');
const { KEYS } = require('../lib/utils/constants');

const usage = `
Serve project

Usage: csnw-build serve [options]

Options:
  --host      Host [default: localhost]
  -p, --port  Port [default: 8080]
  --open      Open project
  --https     Use https`;

module.exports = async function dev(args) {
  if (args.help) {
    console.log(usage);
    return;
  }

  const running = deferred();

  let project;
  const start = async () => {
    project = await Project.load(args);
    project.serve(args);

    project.tasks[0].once('status', status => {
      console.log(`${status}.\nPress q to quit or r to restart.`);
    });
  };

  const restart = () => {
    project && project.close();
    start();
  };
  const quit = () => {
    project && project.close();
    running.resolve();
  };

  start();

  process.on('SIGINT', () => quit());
  process.on('SIGTERM', () => quit());

  const stdin = process.stdin;
  if (typeof stdin.setRawMode === 'function') {
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('hex');
    stdin.on('data', key => {
      if (key === KEYS.Q || key === KEYS.CONTROL_C || key === KEYS.CONTROL_D) {
        quit();
      } else if (key === KEYS.R) {
        restart();
      }
    });
  }

  return running;
};
