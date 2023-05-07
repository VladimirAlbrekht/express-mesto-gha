const router = require('express').Router();
const { checkAuth } = require('../middlewares/auth');
const {
  validateSignup,
  validateSignin,
  validateAuth,
  validateUser,
  validateUserProfile,
  validateUserAvatar,
} = require('../middlewares/validation');

const {
  createUser,
  login,
  getUsers,
  getUserById,
  getCurrentUser,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

// открытые маршруты
router.post('/signup', validateSignup, createUser);
router.post('/signin', validateSignin, login);

// защищенные маршруты
router.use(validateAuth, checkAuth);
router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.patch('/me', validateUserProfile, updateUser);
router.patch('/me/avatar', validateUserAvatar, updateAvatar);
router.get('/:userId', validateUser, getUserById);

module.exports = router;
