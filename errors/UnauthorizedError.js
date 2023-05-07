const http2 = require('http2');

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = http2.constants.HTTP_STATUS_UNAUTHORIZED;
    this.name = 'UnauthorizedError';
  }
}

module.exports = UnauthorizedError;
