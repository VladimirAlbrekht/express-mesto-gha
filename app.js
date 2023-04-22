// app.js — входной файл
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const express = require('express');
const mongoose = require('mongoose');
const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestobd', { useNewUrlParser: true, useUnifiedTopology: true });

// подключаем мидлвары, роуты и всё остальное...
  app.use((req, res, next) => {
    req.user = {
      _id: "643ff4831e6c641ac2d5648d" // вставьте сюда _id созданного в предыдущем пункте пользователя
    };
    next();
  });

  // controllers/cards.js
  module.exports.createCard = (req, res) => {
    const { name, link } = req.body;
    const userId = req.user._id; // получаем _id пользователя из объекта req.user

    // создаем карточку с использованием userId
  };


// добавляем обработку JSON в body запроса
app.use(express.json());

// добавляем маршруты
app.use('/', usersRouter);
// добавляем маршруты
app.use('/', cardsRouter);


app.listen(3000, function () {
  console.log('Server started on port 3000');
});

