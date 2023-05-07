const { ERROR_CODE_SERVER } = require('./errorsStatus');

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = ERROR_CODE_SERVER;
  }
}

module.exports = ServerError;
