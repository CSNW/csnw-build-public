const detect = require('detect-port-alt');

module.exports = {
  async isPortAvailable(host, port) {
    return port === (await detect(port, host));
  },
  async findPort(host, port) {
    return await detect(port, host);
  }
};
