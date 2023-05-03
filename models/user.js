const mongoose = require('mongoose');
const validator = require('validator');

// Создаем схему пользователя
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
  },
  avatar: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: 'Неверный формат email',
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false, // устанавливаем select: false для поля password
  },
});


module.exports = mongoose.model('user', userSchema);
