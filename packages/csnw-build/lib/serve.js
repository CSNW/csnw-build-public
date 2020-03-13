const debug = require('debug')('csnw-build:serve');
const http = require('http');
const serveStatic = require('serve-static');
const serveIndex = require('serve-index');
const { isPortAvailable } = require('@csnw-build/utils');

module.exports = options => ({
  name: 'Serve',
  run: async function serve(config, args, task) {
    const { server: app } = args;
    const { https: use_https, host, port } = config;
    const protocol = use_https ? 'https' : 'http';
    let public_url = process.env.PUBLIC_URL || '/';
    if (!public_url.startsWith('/')) public_url = `/${public_url}`;

    const url = `${protocol}://${host}:${port}${public_url}`;

    // Add middleware to connect app
    for (const plugin of config.use) {
      if (!plugin.connect) continue;
      await plugin.connect(app);
    }

    app.use(public_url, serveStatic(config.dest));
    app.use(public_url, serveIndex(config.dest));
    // TODO serve "public" folder

    let server;
    if (use_https) {
      // TODO Add certs to enable https
      throw new Error('https is not currently supported');
    } else {
      server = http.createServer(app);
    }

    if (!await isPortAvailable(host, port)) {
      throw new Error(`Something is already running on port ${port}.`);
    }

    const sockets = new Set();
    await new Promise((resolve, reject) => {
      server.listen(port, host, err => {
        if (err) return reject(err);

        server.on('connection', socket => {
          sockets.add(socket);
          socket.on('close', () => sockets.delete(socket));
        });
        server.on('request', req => {
          debug(`request ${req.method} ${req.url}`);
        });

        debug(`listening on ${url}`);
        task.status(`Listening on ${url}`);
        task.ready = true;

        app.emit('listening');
        app.listening = true;

        resolve();
      });
    });

    await task.closed;

    app.emit('close');
    for (const socket of sockets) {
      socket.destroy();
    }
    server.close();

    debug('closed server');
    task.status('Closed.');
  }
});

function remove(values, value) {
  values.splice(values.indexOf(value, 1));
}
