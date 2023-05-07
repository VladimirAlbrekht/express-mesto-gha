const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { UNAUTHORIZED, NOT_FOUND, BAD_REQUEST } = require('../errors/errors');
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

    return res.send(newUser.toJSON());
  } catch (error) {
    console.error(error);
    if (error.name === 'UnauthorizedError') {
      return res.status(UNAUTHORIZED).json({ message: 'Необходима авторизация' });
    }
    return res.status(BAD_REQUEST).send({ message: 'Ошибка сохранения нового пользователя' });
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
    return res.status(BAD_REQUEST).json({ message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (err) {
    return res.status(BAD_REQUEST).send({ message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
};

const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(BAD_REQUEST).send({ message: INVALID_USER_ID_ERROR });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
    }

    return res.send(user);
  } catch (error) {
    console.error(error);
    return res.status(UNAUTHORIZED).json({ message: 'Необходима авторизация' });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error(error);
    if (error.name === 'UnauthorizedError') {
      return res.status(UNAUTHORIZED).json({ message: 'Необходима авторизация' });
    }
    return res.status(BAD_REQUEST).json({ message: 'Ошибка получения данных текущего пользователя' });
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
      if (!user) {
        return res.status(NOT_FOUND).json({ message: 'Пользователь не найден' });
      }

      if (user._id.toString() !== req.user._id.toString()) {
        return res.status(UNAUTHORIZED).json({ message: 'Вы не можете редактировать данные других пользователей' });
      }

      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(BAD_REQUEST).json({ message: 'Ошибка валидации' });
      }

      return res.status(BAD_REQUEST).json({ message: INTERNAL_SERVER_ERROR_MESSAGE });
    });
};

const updateAvatar = async (req, res) => {
  const { avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );

    if (!user) {
      return res.status(NOT_FOUND).json({ message: 'Пользователь не найден' });
    }

    return res.send(user);
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(BAD_REQUEST).json({ message: 'Ошибка валидации' });
    }

    return res.status(BAD_REQUEST).json({ message: INTERNAL_SERVER_ERROR_MESSAGE });
  }
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
