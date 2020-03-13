module.exports = value => {
  return Array.isArray(value) ? value : value === undefined ? [] : [value];
};
