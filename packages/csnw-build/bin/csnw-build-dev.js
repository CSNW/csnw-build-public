const clearConsole = require('react-dev-utils/clearConsole');
const { deferred } = require('@csnw-build/utils');
const Project = require('../lib/project');
const { KEYS } = require('../lib/utils/constants');

const usage = `
Build project in development mode

Usage: csnw-build dev [options]

Options:
  --mode      Build mode [default: development]
  --host      Host [default: localhost]
  -p, --port  Port [default: 8080]
  --open      Open project
  --https     Use https`;

let is_interactive = process.stdout.isTTY;

module.exports = async function dev(args) {
  if (args.help) {
    console.log(usage);
    return;
  }

  if (args.debug) is_interactive = false;

  const running = deferred();

  let project;
  const start = async () => {
    project = await Project.load(args);
    project.dev(args);

    render(project);
  };
  const restart = async () => {
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

  await running;
};

function render(project) {
  let width = 0;
  const tasks = [];

  const addTask = task => {
    const index = tasks.length;
    const { name } = task;
    if (name.length > width) width = name.length;

    task.on('status', status => {
      tasks[index].status = status;
      rerender();
    });

    tasks.push({ name, status: 'Starting...' });
  };

  project.on('add', task => {
    addTask(task);
    rerender();
  });

  project.tasks.forEach(addTask);
  rerender();

  function rerender() {
    if (is_interactive) {
      clearConsole();
    }

    for (const task of tasks) {
      console.log(`${pad(task.name, width)} - ${task.status}`);
    }

    if (is_interactive) {
      console.log();
      console.log('Watching (press q = quit or r = restart)\n');
    }
  }
}

function pad(value, width) {
  while (value.length < width) {
    value += ' ';
  }
  return value;
}
