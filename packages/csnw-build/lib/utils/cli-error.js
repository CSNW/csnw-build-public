const cleanError = require('./clean-error');

module.exports = class CliError extends Error {
  constructor(message, options = {}) {
    const { noStack = false, original } = options;

    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CliError);
    }

    this.noStack = noStack;
    this.original = original;
  }

  get formatted() {
    return cleanError(this);
  }
};
