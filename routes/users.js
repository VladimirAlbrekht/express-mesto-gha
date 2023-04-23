const router = require('express').Router();

const {
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

// создает пользователя
router.post('/', createUser);

// обновляет данные пользователя
router.patch('/me', updateUser);

// обновляет аватар
router.patch('/me/avatar', updateAvatar);

module.exports = router;
