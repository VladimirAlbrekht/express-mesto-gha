const { checkToken } = require('../utils/token');
const User = require('../models/user');

const checkAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  // console.log('Token:', token);

  const checkResult = checkToken(token);

  if (!checkResult) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await User.findById(checkResult._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.user = user;
    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { checkAuth };
