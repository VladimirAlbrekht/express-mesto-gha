const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { INTERNAL_SERVER_ERROR, UNAUTHORIZED, NOT_FOUND, BAD_REQUEST } = require('../errors/errors');
const User = require('../models/user');
const {generateToken} = require('../utils/token')

const INTERNAL_SERVER_ERROR_MESSAGE = 'Внутренняя ошибка сервера';
const INVALID_CREDENTIALS_ERROR = 'Неправильные почта или пароль';
const INVALID_USER_ID_ERROR = 'Некорректный идентификатор пользователя';

const createUser = async (req, res) => {
  const { name = 'Жак-Ив Кусто', about = 'Исследователь', avatar = 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png', email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(BAD_REQUEST).send({ message: 'Пользователь с таким email уже существует' });
    }
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, about, avatar, email, password: hash});

  if (newUser) {
    return res.status(200).send({_id: newUser._id});
  }
     res.status(500).send({error:'Server error'});

  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).send({ message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};


const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(UNAUTHORIZED).json({ message: INVALID_CREDENTIALS_ERROR });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(UNAUTHORIZED).json({ message: INVALID_CREDENTIALS_ERROR });
    }

    const payload = { _id: user._id, email: user.email};

    const token = generateToken(payload);
    console.log(token);
    return res.status(200).json({token});

  } catch (err) {
    res.status(INTERNAL_SERVER_ERROR).json({ message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};


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


const updateUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(NOT_FOUND).json({ message: 'Пользователь не найден' });
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(BAD_REQUEST).json({ message: 'Длина сообщения должна быть более 2 и менее 30 символов' });
      } else {
        res.status(INTERNAL_SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
      }
    });
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
  login,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
};
