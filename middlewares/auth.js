const { checkToken } = require('../utils/token');
const User = require('../models/user');
const AuthError = require('../errors/authError');
const NoFoundError = require('../errors/noFoundError');

const checkAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return next(new AuthError('Токен отсутствует или некорректен'));
  }

  const checkResult = checkToken(token);

  if (!checkResult) {
    return next(new AuthError('Токен не верифицирован, авторизация не пройдена'));
  }

  try {
    const user = await User.findById(checkResult._id);
    if (!user) {
      return next(new NoFoundError('Пользователь не найден'));
    }
    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

module.exports = { checkAuth };
