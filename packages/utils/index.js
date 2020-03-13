const deferred = require('./lib/deferred');
const findUp = require('./lib/find-up');
const flatten = require('./lib/flatten');
const formatTime = require('./lib/format-time');
const installPackage = require('./lib/install-package');
const { isString, isBoolean, isFunction } = require('./lib/is');
const { isMatch, matcher } = require('./lib/match');
const md5 = require('./lib/md5');
const { isPortAvailable, findPort } = require('./lib/ports');
const Profiler = require('./lib/profiler');
const removeTrailing = require('./lib/remove-trailing');
const requirePeer = require('./lib/require-peer');
const Task = require('./lib/task');
const toArray = require('./lib/to-array');
const unixJoin = require('./lib/unix-join');
const unixPath = require('./lib/unix-path');

module.exports = {
  deferred,
  findUp,
  flatten,
  formatTime,
  installPackage,
  isString,
  isBoolean,
  isFunction,
  isMatch,
  matcher,
  md5,
  isPortAvailable,
  findPort,
  Profiler,
  removeTrailing,
  requirePeer,
  Task,
  toArray,
  unixJoin,
  unixPath
};
