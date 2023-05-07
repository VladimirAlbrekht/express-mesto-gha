const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ConflictError,
  InternalServerError,
} = require('../errors/errors');
const User = require('../models/user');
const { generateToken } = require('../utils/token');

const INTERNAL_SERVER_ERROR_MESSAGE = 'Внутренняя ошибка сервера';
const INVALID_USER_ID_ERROR = 'Некорректный идентификатор пользователя';

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
      throw new ConflictError('Пользователь с таким email уже существует');
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
    if (error instanceof BadRequestError || error instanceof ConflictError) {
      return res.status(error.statusCode).send({ message: error.message });
    }
    return next(new InternalServerError(INTERNAL_SERVER_ERROR_MESSAGE));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError('Неправильные почта или пароль');
    }

    const token = generateToken({ _id: user._id });
    res.cookie('jwt', token);
    return res.status(200).send();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return res.status(error.statusCode).json({ message: error.message });
    } return next(new InternalServerError(INTERNAL_SERVER_ERROR_MESSAGE));
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    return res.send(users);
  } catch (error) {
    return next(new InternalServerError(INTERNAL_SERVER_ERROR_MESSAGE));
  }
};

const getUserById = async (req, res, next) => {
  const { userId } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new BadRequestError(INVALID_USER_ID_ERROR);
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError('Запрашиваемый пользователь не найден');
    }

    return res.send(user);
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      return res.status(error.statusCode).send({ message: error.message });
    } return next(new InternalServerError(INTERNAL_SERVER_ERROR_MESSAGE));
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      throw new NotFoundError('Пользователь не найден');
    }

    return res.json(user);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    } return next(new InternalServerError(INTERNAL_SERVER_ERROR_MESSAGE));
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
        throw new NotFoundError('Пользователь не найден');
      }
      if (user._id.toString() !== req.user._id.toString()) {
        throw new UnauthorizedError('Вы не можете редактировать данные других пользователей');
      }
      return res.send(user);
    })
    .catch((error) => {
      if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Ошибка валидации' });
      }
      return next(new InternalServerError(INTERNAL_SERVER_ERROR_MESSAGE));
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
      throw new NotFoundError('Пользователь не найден');
    }

    return res.send(user);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return res.status(error.statusCode).json({ message: error.message });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Ошибка валидации' });
    }
    return next(new InternalServerError(INTERNAL_SERVER_ERROR_MESSAGE));
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
