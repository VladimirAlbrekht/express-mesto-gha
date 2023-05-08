const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const createCardSchema = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30).required(),
    link: Joi.string().required().pattern(/^(https?:\/\/)(www\.)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?#?$/),
  }),
});

// возвращает все карточки
router.get('/', getCards);
// создает карточку
router.post('/', createCardSchema, createCard);
// удаляет карточку по идентификатору
router.delete('/:cardId', deleteCard);
// ставит лайк карточке
router.put('/:cardId/likes', likeCard);
// убирает лайк с карточки
router.delete('/:cardId/likes', dislikeCard);
module.exports = router;
