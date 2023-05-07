const express = require('express');
const { celebrate, Joi } = require('celebrate');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
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

// Middleware для проверки тела запроса с помощью celebrate
app.use(
  celebrate({
    body: Joi.object().keys({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    }),
  }),
);

// Middleware для обработки ошибок валидации
app.use((err, req, res, next) => {
  if (err.joi) {
    // Если ошибка валидации, отправляем ответ с кодом статуса 400 и сообщением об ошибке
    res.status(400).json({ message: err.joi.details[0].message });
  } else {
    // Если другая ошибка, передаем управление следующему middleware
    next(err);
  }
});

// Middleware для обработки ошибок celebrate
app.use(errors());

// Middleware для обработки ошибок
app.use(errorHandler);
