// Inspired by jest-message-util
// https://github.com/facebook/jest/blob/03bf2a93c7b99d08ccad1a86ace4c99555f83017/packages/jest-message-util/src/index.js

const StackUtils = require('stack-utils');

const ANONYMOUS_FN_IGNORE = /^\s+at <anonymous>.*$/;
const ANONYMOUS_PROMISE_IGNORE = /^\s+at (new )?Promise \(<anonymous>\).*$/;
const ANONYMOUS_GENERATOR_IGNORE = /^\s+at Generator.next \(<anonymous>\).*$/;
const NATIVE_NEXT_IGNORE = /^\s+at next \(native\).*$/;
const STACK_PATH_REGEXP = /\s*at.*\(?(\:\d*\:\d*|native)\)?/;
const MESSAGE_REGEXP = /(^(.|\n)*?(?=\n\s*at\s.*\:\d*\:\d*))/;
const ERROR_TEXT = 'Error: ';
const internals = StackUtils.nodeInternals();

const trim = string => (string || '').replace(/^\s+/, '').replace(/\s+$/, '');
const trimPaths = string =>
  string.match(STACK_PATH_REGEXP) ? trim(string) : string;

module.exports = function cleanError(error) {
  const content = typeof error === 'string' ? error : error.stack;

  let { message, stack } = getErrorParts(content || 'EMPTY ERROR');

  if (error.original) {
    const original =
      typeof error.original === 'string'
        ? error.original
        : error.original.stack;
    const originalParts = getErrorParts(original);

    message += `\n\n${originalParts.message}`;
    stack = originalParts.stack;
  }

  stack = error.noStack ? '' : `${formatStack(stack)}`;

  return { message, stack };
};

function getErrorParts(content) {
  const messageMatch = content.match(MESSAGE_REGEXP);
  let message = messageMatch ? messageMatch[0] : 'Error';
  const stack = messageMatch ? content.slice(message.length) : content;

  if (message.startsWith(ERROR_TEXT)) {
    message = message.substr(ERROR_TEXT.length);
  }

  return { message, stack };
}

function formatStack(stack) {
  return stack
    .split(/\n/)
    .filter(Boolean)
    .filter(line => {
      if (ANONYMOUS_FN_IGNORE.test(line)) return false;
      if (ANONYMOUS_PROMISE_IGNORE.test(line)) return false;
      if (ANONYMOUS_GENERATOR_IGNORE.test(line)) return false;
      if (NATIVE_NEXT_IGNORE.test(line)) return false;
      if (internals.some(internal => internal.test(line))) return false;
      if (!STACK_PATH_REGEXP.test(line)) return true;

      return true;
    })
    .map(trimPaths)
    .join('\n');
}
