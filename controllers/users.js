const mongoose = require('mongoose');
const { NOT_FOUND, BAD_REQUEST, INTERNAL_SERVER_ERROR } = require('../errors/errors');
const User = require('../models/user');

const INVALID_USER_ID_ERROR = 'Некорректный идентификатор пользователя';
const INTERNAL_SERVER_ERROR_MESSAGE = 'Внутренняя ошибка сервера';

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.send(users);
  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};

const getUserById = (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(BAD_REQUEST).send({ message: INVALID_USER_ID_ERROR });
  }

  return User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      return res.send(user);
    })
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
      err,
    }));
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;
  return User.create({ name, about, avatar })
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res.status(INTERNAL_SERVER_ERROR).json({
        message: INTERNAL_SERVER_ERROR_MESSAGE,
        err,
      });
    });
};

const updateUser = (req, res) => {
  const { name, about } = req.body;
  if (name.length < 2 || name.length > 30) {
    return res.status(BAD_REQUEST).json({ message: 'Поле name должно содержать от 2 до 30 символов' });
  }
  if (about && (about.length < 2 || about.length > 30)) {
    return res.status(BAD_REQUEST).json({ message: 'Поле about должно содержать от 2 до 30 символов' });
  }
  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (user) {
        return res.json(user);
      }
      return res.status(NOT_FOUND).json({ message: 'Пользователь не найден' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).json({ message: 'Переданы некорректные данные' });
      }
      return res.status(BAD_REQUEST).json({ message: `Ошибка на сервере: ${err}` });
    });
  return null;
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(
    req.user._id,
    { avatar },
    { new: true, runValidators: true },
  )
    .then((user) => (user ? res.json(user) : res.status(NOT_FOUND).json({ message: 'Запрашиваемый пользователь не найден' })))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
      err,
    }));
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
};
