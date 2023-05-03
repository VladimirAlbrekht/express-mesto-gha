const { checkToken } = require('../utils/token');

const checkAuth = (req, res, next) => {
  const token = req.headers.authorization;

  try {
    const payload = checkToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = {checkAuth};