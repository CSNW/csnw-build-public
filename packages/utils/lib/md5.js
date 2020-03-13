const { createHash } = require('crypto');

module.exports = content => {
  return createHash('md5')
    .update(content)
    .digest('hex');
};
