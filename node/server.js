const { EventEmitter } = require('events');
const http = require('http');

const Koa = require('koa');
const serve = require('koa-static');

class Server extends EventEmitter {

  constructor(id, rpc) {
    super();

    this._id = id;
    this._rpc = rpc;
    this._wwwRootPath = '.'
    this._port = 3000
    this._server = null;
  }

  getId() {
    return this._id;
  }

  start() {
    if (this._server) {
      // Sync with client.
      this.syncStatus();
      return;
    }

    // Configure Koa application.
    const app = new Koa();
    app.use(serve(this._wwwRootPath));

    this._server = http.createServer(app.callback());
    this._server.once('listening', (function () {
      this.syncStatus();
    }).bind(this));
    this._server.listen(this._port);
  }

  stop() {
    if (!this._server) {
      // Sync with client.
      this.syncStatus();
      return;
    }

    this._server.close((function () {
      this._server = null;
      this.syncStatus();
    }).bind(this));
  }

  setRootPath(rootPath) {
    this._wwwRootPath = rootPath;
  }

  getRootPath() {
    return this._wwwRootPath;
  }

  syncStatus() {
    this._rpc.sendMessage({
      cmd: 'sync_server_status',
      payload: {
        serverId: this._id,
        status: (this._server ? 'on' : 'off')
      }
    });
  }

}

module.exports = Server;