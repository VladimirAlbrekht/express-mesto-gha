const http2 = require('http2');

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = http2.constants.HTTP_STATUS_NOT_FOUND;
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
