const { ERROR_CODE_NOT_FOUND } = require('./errorsStatus');

class NoFoundError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = ERROR_CODE_NOT_FOUND;
  }
}

module.exports = NoFoundError;
