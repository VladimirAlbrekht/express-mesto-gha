const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const User = require('../models/user');
const { generateToken } = require('../utils/token');

const ValidationError = require('../errors/validationError');
const NoFoundError = require('../errors/noFoundError');
const UserExistError = require('../errors/userExistError');
const NoRightsError = require('../errors/noRightsError');
const ServerError = require('../errors/serverError');
const AuthError = require('../errors/authError');

const createUser = async (req, res, next) => {
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
      throw new UserExistError('Пользователь с таким email уже существует');
    }

    if (name.length < 2) {
      throw new ValidationError('Имя пользователя должно содержать не менее 2 символов');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      about,
      avatar,
      email,
      password: hashedPassword,
    });

    return res.status(201).send(newUser.toJSON()); // устанавливаем код статуса явно
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NoRightsError) {
      return res.status(error.statusCode).send({ message: error.message });
    }
    return next(new ServerError('Внутренняя ошибка сервера'));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AuthError('Неправильные почта или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AuthError('Неправильные почта или пароль');
    }

    const token = generateToken({ _id: user._id });
    res.cookie('jwt', token);
    return res.status(200).send();
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ message: error.message });
    } return next(new ServerError('Внутренняя ошибка сервера'));
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    return next(new ServerError('Внутренняя ошибка сервера'));
  }
};

const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ValidationError('Некорректный идентификатор пользователя');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new NoFoundError('Запрашиваемый пользователь не найден');
    }

    return res.send(user);
  } catch (error) {
    if (error instanceof ValidationError || error instanceof NoFoundError) {
      return res.status(error.statusCode).send({ message: error.message });
    } return next(new ServerError('Внутренняя ошибка сервера'));
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new NoFoundError('Пользователь не найден');
    }

    return res.json(user);
  } catch (error) {
    if (error instanceof NoFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    } return next(new ServerError('Внутренняя ошибка сервера'));
  }
};

const updateUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(
    req.user._id,
    { name, about },
    { new: true, runValidators: true },
  )
    .then((user) => {
      if (!user) {
        throw new NoFoundError('Пользователь не найден');
      }
      if (user._id.toString() !== req.user._id.toString()) {
        throw new AuthError('Вы не можете редактировать данные других пользователей');
      }
      return res.send(user);
    })
    .catch((error) => {
      if (error instanceof NoFoundError || error instanceof AuthError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Ошибка валидации' });
      }
      return next(new ServerError('Внутренняя ошибка сервера'));
    });
};

const updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
    );

    if (!user) {
      throw new NoFoundError('Пользователь не найден');
    }

    return res.send(user);
  } catch (error) {
    if (error instanceof NoFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Ошибка валидации' });
    }
    return next(new ServerError('Внутренняя ошибка сервера'));
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
