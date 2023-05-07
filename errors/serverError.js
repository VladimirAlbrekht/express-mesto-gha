const { INTERNAL_SERVER_ERROR } = require('./errorsStatus');

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = INTERNAL_SERVER_ERROR;
  }
}

module.exports = ServerError;
