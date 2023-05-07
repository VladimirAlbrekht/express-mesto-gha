const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const handleErrors = require('./middlewares/errorHandler');

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
mongoose.connect('mongodb://localhost:27017/mestobd', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Подключаем маршруты
app.use('/users', usersRouter);
app.use('/cards', cardsRouter);

// Middleware для обработки ошибок celebrate
app.use(errors());

// Middleware для обработки ошибок
app.use(handleErrors);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
