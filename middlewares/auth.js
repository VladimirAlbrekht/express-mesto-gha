const { checkToken } = require('../utils/token');
const User = require('../models/user');
const AuthError = require('../errors/authError');
const ServerError = require('../errors/serverError');
const NoFoundError = require('../errors/noFoundError');

const checkAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return next(new AuthError('Токен остутствует или некорректен'));
  }

  const checkResult = checkToken(token);

  if (!checkResult) {
    next(new AuthError('Токен не верифицирован, авторизация не пройдена'));
  }

  try {
    const user = await User.findById(checkResult._id);
    if (!user) {
      return new NoFoundError('Пользователь не найден');
    }
    req.user = user;
    return next();
  } catch (error) {
    return new ServerError('Ошибка сервера');
  }
};

module.exports = { checkAuth };
