module.exports = path => {
  if (path.length <= 1 || path[path.length - 1] !== '/') return path;
  return path.slice(0, -1);
};
