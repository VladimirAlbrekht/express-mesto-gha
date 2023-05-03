const express = require('express');
const mongoose = require('mongoose');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const errors = require('./errors/errors'); // добавляем модуль ошибок
const {checkAuth} = require('./middlewares/auth');

const app = express();

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
app.use('/users', checkAuth, usersRouter);
app.use('/cards', cardsRouter);

app.post('/signup', (req, res) => {
  // здесь должна быть логика создания нового пользователя
  const user = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  };

  // устанавливаем заголовок Content-Type
  res.set('Content-Type', 'application/json');

  // отправляем ответ клиенту
  res.json({ message: 'User created successfully', user });
});

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


app.listen(3000, () => {
  console.log('Server started on port 3000');
});
