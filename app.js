// app.js — входной файл
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');


const express = require('express');
const mongoose = require('mongoose');
const app = express();

// добавляем обработку JSON в body запроса
app.use(express.json());

// добавляем middleware для установки заголовка Content-Type
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json');
  req.user = {
    _id: "643ff4831e6c641ac2d5648d" // вставьте сюда _id созданного в предыдущем пункте пользователя
  };
  next();
});

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestobd', { useNewUrlParser: true, useUnifiedTopology: true });


// подключаем маршруты
app.use('/', usersRouter);
app.use('/', cardsRouter);

app.listen(3000, function () {
  console.log('Server started on port 3000');
});