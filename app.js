const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const errors = require('./errors/errors'); // добавляем модуль ошибок
const errorHandler = require('./middlewares/errorHandler');

const app = express();
app.use(cookieParser());

// Добавляем middleware для обработки JSON в body запроса
app.use(express.json());

// Добавляем middleware для установки заголовка Content-Type
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Подключаемся к серверу MongoDB
mongoose.connect('mongodb://localhost:27017/mestobd', { useNewUrlParser: true, useUnifiedTopology: true });

// Подключаем маршруты
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

// Middleware для обработки ошибок 404
app.use((req, res, next) => {
  res.status(errors.NOT_FOUND).json({ message: 'Запрашиваемый ресурс не найден' });
  next();
});

// Middleware для обработки ошибок 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(errors.INTERNAL_SERVER_ERROR).json({ message: 'Внутренняя ошибка сервера' });
  next();
});

// Middleware для обработки ошибок
app.use(errorHandler);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
