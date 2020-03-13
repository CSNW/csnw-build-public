module.exports = (options = {}) => {
  const { profile } = options;

  return files => {
    profile && (profile.skipped = true);
    profile && profile.done();

    return files;
  };
};
