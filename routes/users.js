const router = require('express').Router();
const {
  login,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateAvatar,
} = require('../controllers/users');

// возвращает всех пользователей
router.get('/', getUsers);

// возвращает пользователя по _id
router.get('/:userId', getUserById);

// обновляет данные пользователя
router.patch('/me', updateUser);


// обновляет аватар
router.patch('/me/avatar', updateAvatar);

router.post('/signin', login);
router.post('/signup', createUser);

module.exports = router;
