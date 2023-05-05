const router = require('express').Router();
const { checkAuth } = require('../middlewares/auth');

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
router.post('/signup', createUser);
router.post('/signin', login);

// защищенные маршруты
router.use(checkAuth);
router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);
router.get('/:userId', getUserById);

module.exports = router;
