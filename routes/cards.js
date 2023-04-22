const router = require('express').Router();
const { getCards, createCard, deleteCard, likeCard, dislikeCard } = require('../controllers/cards');

// возвращает все карточки
router.get('/cards', getCards);

// создает карточку
router.post('/cards', createCard);

// удаляет карточку по идентификатору
router.delete('/cards/:cardId', deleteCard);

// ставит лайк карточке
router.put('/cards/:cardId/likes', likeCard);

// убирает лайк с карточки
router.delete('/cards/:cardId/likes', dislikeCard);

module.exports = router;
