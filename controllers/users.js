const bcrypt = require('bcrypt');

const mongoose = require('mongoose');
const {
  INTERNAL_SERVER_ERROR,
  UNAUTHORIZED,
  NOT_FOUND,
  BAD_REQUEST,
} = require('../errors/errors');
const User = require('../models/user');
const { generateToken } = require('../utils/token');

const INTERNAL_SERVER_ERROR_MESSAGE = 'Внутренняя ошибка сервера';

const INVALID_USER_ID_ERROR = 'Некорректный идентификатор пользователя';

const createUser = async (req, res) => {
  const {
    name = 'Жак-Ив Кусто',
    about = 'Исследователь',
    avatar = 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    email,
    password,
  } = req.body;

  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(BAD_REQUEST).send({ message: 'Пользователь с таким email уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      return res.send(newUser.toJSON());
    }
    return res.status(500).send({ error: 'Server error' });
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).send({ message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.sendStatus(UNAUTHORIZED);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.sendStatus(UNAUTHORIZED);
    }

    const token = generateToken({ _id: user._id });
    res.cookie('jwt', token);
    return res.status(200).send();
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).json({ message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).send({ message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};

const getUserById = (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(BAD_REQUEST).send({ message: INVALID_USER_ID_ERROR });
  }

  return User.findById(userId)
    .then((user) => (user ? res.send(user) : res.status(401).send({ message: 'Запрашиваемый пользователь не найден' })))
    .catch((err) => res.status(INTERNAL_SERVER_ERROR).json({
      message: INTERNAL_SERVER_ERROR_MESSAGE,
      err,
    }));
};

const getCurrentUser = async (req, res) => {
  console.log('User:', req.user);
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
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
        return res.send(user);
      }

      return res.status(NOT_FOUND).json({ message: 'Пользователь не найден' });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).json({ message: 'Длина сообщения должна быть более 2 и менее 30 символов' });
      }

      return res.status(INTERNAL_SERVER_ERROR).json({ message: 'На сервере произошла ошибка' });
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
  createUser,
  login,
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  updateAvatar,
};
