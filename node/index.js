const RPC = require('./rpc');
const { readConfig, writeConfig } = require('./config');

const rpc = new RPC(process.stdin, process.stdout);
const servers = new Array();

require('./commands').registerCommands(rpc, servers);