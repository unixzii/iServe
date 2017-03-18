const path = require('path');
const fs = require('fs');

function getConfigPath() {
  return path.join(process.env['HOME'], '.iserve', 'config.json');
}

function readConfig() {
  const configPath = getConfigPath();
  if (fs.existsSync(configPath)) {
    try {
      const contents = fs.readFileSync(configPath).toString('utf-8');
      return JSON.parse(contents);
    } catch (e) {
      return {};
    }
  }
  return {};
}

function writeConfig(cfg) {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    // Make sure all indirect directories is created.
    fs.mkdirSync(path.join(process.env['HOME'], '.iserve'));
  }

  fs.writeFileSync(configPath, Buffer.from(JSON.stringify(cfg, '', '  '), 'utf-8'));
}

module.exports = { readConfig, writeConfig };