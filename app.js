// app.js — входной файл
const usersRouter = require('./routes/users');

const express = require('express');
const mongoose = require('mongoose');
const app = express();

// подключаемся к серверу mongo
mongoose.connect('mongodb://localhost:27017/mestobd',
{ useNewUrlParser: true, useUnifiedTopology: true })
// подключаем мидлвары, роуты и всё остальное...
  app.use((req, res, next) => {
    req.user = {
      _id: '643d5a9b6c08b7dc424118aa' // вставьте сюда _id созданного в предыдущем пункте пользователя
    };
    next();
  });
 module.exports.createCard = (req, res) => {
    const { name, link } = req.body;
    const userId = req.user._id; // получаем _id пользователя из объекта req.user
  };


// добавляем обработку JSON в body запроса
app.use(express.json());

// добавляем маршруты
app.use('/', usersRouter);

app.listen(3000, function () {
  console.log('Server started on port 3000');
});

