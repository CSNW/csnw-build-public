module.exports = function pipe(...tasks) {
  const result = async files => {
    let result = files;
    for (const task of tasks) {
      result = await task(result);
    }
    return result;
  };

  return result;
};
