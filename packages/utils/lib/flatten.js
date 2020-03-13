module.exports = values =>
  values.reduce((memo, value) => memo.concat(value), []);
