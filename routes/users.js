const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
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

const signUpSchema = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().uri(),
    email: Joi.string().email().required(),
    password: Joi.string().required().presence('required'),
  }),
});

const signInSchema = celebrate({
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

// открытые маршруты
router.post('/signup', signUpSchema, createUser);
router.post('/signin', signInSchema, login);

// защищенные маршруты
router.use(checkAuth);
router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.patch('/me', updateUser);
router.patch('/me/avatar', updateAvatar);
router.get('/:userId', getUserById);

module.exports = router;
