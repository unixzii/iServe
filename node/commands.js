const path = require('path');
const fs = require('fs');

const uuidV1 = require('uuid/v1');

const Server = require('./server');
const { readConfig, writeConfig } = require('./config');

function registerCommands(rpc, servers) {
  
  // Util function to get a specific server.
  function getServer(id) {
    for (let i in servers) {
      if (servers[i].getId() === id) {
        return servers[i];
      }
    }
    
    return null;
  }

  rpc.onCommand('show_version', function (payload) {
    rpc.sendMessage({
      cmd: 'show_version_reply',
      payload: '0.1.0'
    });
  });

  rpc.onCommand('add_server', function (payload) {
    const id = uuidV1();
    const server = new Server(id, rpc);
    servers.push(server);
    rpc.sendMessage({
      cmd: 'add_server',
      payload: {
        index: servers.length - 1,
        id
      }
    });
  });

  rpc.onCommand('set_server_root_path', function (payload) {
    const id = payload['id'];
    if (!id) {
      return;
    }

    let rootPath = payload['rootPath'];
    if (!rootPath) {
      return;
    }

    rootPath = path.resolve(rootPath);
    if (!fs.existsSync(rootPath)) {
      return;
    }

    const server = getServer(id);
    if (server) {
      server.setRootPath(rootPath);
      server.syncStatus();
    }
  });

  rpc.onCommand('start_server', function (payload) {
    const id = payload['id'];
    if (!id) {
      return;
    }

    const server = getServer(id);
    if (server) {
      server.start();
    }
  });

  rpc.onCommand('stop_server', function (payload) {
    const id = payload['id'];
    if (!id) {
      return;
    }

    const server = getServer(id);
    if (server) {
      server.stop();
    }
  });

  rpc.onCommand('save_config', function () {
    let dict = {};
    dict['servers'] = [];

    for (let i in servers) {
      const server = servers[i];
      dict['servers'].push({
        id: server.getId(),
        rootPath: server.getRootPath()
      });
    }

    writeConfig(dict);

    rpc.sendMessage({
      cmd: 'save_config_reply'
    });
  });
}

module.exports = { registerCommands };