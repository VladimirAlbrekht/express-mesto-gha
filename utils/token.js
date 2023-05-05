const JWT = require('jsonwebtoken');

const SECRET_KEY = 'SECRET';

function generateToken(payload) {
  return JWT.sign(payload, SECRET_KEY, { expiresIn: '7d' });
}

function checkToken(token) {
  if (!token) {
    return { error: 'Token is missing' };
  }
  try {
    return JWT.verify(token, SECRET_KEY);
  } catch (err) {
    return { error: err.message };
  }
}

module.exports = { generateToken, checkToken };
