const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const app = express();

// добавляем обработку JSON в body запроса
app.use(express.json());

// добавляем middleware для установки заголовка Content-Type
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');

  next();
});

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestobd', { useNewUrlParser: true, useUnifiedTopology: true });

// подключаем middleware для обработки ошибок
app.use((req, res, next) => {
  console.log(res);
  req.user = {
    _id: "643ff4831e6c641ac2d5648d" // вставьте сюда _id созданного в предыдущем пункте пользователя
  };
  next();
});

// подключаем маршруты
app.use('/', usersRouter);
app.use('/', cardsRouter);

// Middleware для обработки ошибок 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Запрашиваемый ресурс не найден' });
  next();
});

// Middleware для обработки ошибок 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  next();
});

app.listen(3000, function () {
  console.log('Server started on port 3000');
});