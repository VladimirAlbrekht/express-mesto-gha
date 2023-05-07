const http2 = require('http2');

class InternalServerError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;
    this.name = 'InternalServerError';
  }
}

module.exports = InternalServerError;
