const http2 = require('http2');

function errorHandler(err, req, res) {
  // Определяем статусный код ошибки
  const statusCode = err.statusCode || http2.constants.HTTP_STATUS_INTERNAL_SERVER_ERROR;

  // Определяем сообщение об ошибке
  const message = err.message || http2.constants.HTTP_STATUS_CODES[statusCode];

  // Отправляем клиенту ответ с ошибкой
  res.status(statusCode).json({ message });
}

module.exports = errorHandler;
