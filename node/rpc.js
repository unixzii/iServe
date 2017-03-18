const { EventEmitter } = require('events');

class RPC extends EventEmitter {

  constructor(stdin, stdout) {
    super();

    this._stdin = stdin;
    this._stdout = stdout;
    this._buf = '';

    this._stdin.on('data', (function (chunk) {
      this._buf += Buffer.from(chunk).toString('utf-8');

      const delimeterIdx = this._buf.indexOf('\n');
      if (delimeterIdx !== -1) {
        // We have a complete packet now.
        const packet = this._buf.substr(0, delimeterIdx);
        this._buf = this._buf.substr(delimeterIdx + 1);

        this._handlePacket(packet);
      }
    }).bind(this));
    this._stdin.resume();
  }

  _handlePacket(packet) {
    try {
      const msg = JSON.parse(packet);
      // Check whether the message is valid.
      if (msg.hasOwnProperty('cmd')) {
        this.emit('command', msg);
      }
    } catch (e) {
      this.sendMessage({
        cmd: 'report_error',
        error: e.message
      });
    }
  }

  /**
   * Convenient method to add listener for specific command.
   * @param {string} cmd - command to be listened
   * @param {function} callback - callback when command received
   */
  onCommand(cmd, callback) {
    this.on('command', function (args) {
      if (args['cmd'] === cmd) {
        callback(args['payload']);
      }
    });
  }

  sendMessage(msg) {
    const buf = Buffer.from(JSON.stringify(msg) + '\n', 'utf-8');
    this._stdout.write(buf);
  }

}

module.exports = RPC;