const mongoose = require('mongoose');
const Card = require('../models/card');

const ValidationError = require('../errors/validationError');
const NoFoundError = require('../errors/noFoundError');
const NoRightsError = require('../errors/noRightsError');

const getCards = (req, res, next) => {
  Card.find({})
    .populate(['owner', 'likes'])
    .then((cards) => res.json(cards))
    .catch((error) => next(error));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.json(card))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        throw new ValidationError(error.message);
      } else {
        throw error;
      }
    })
    .catch((error) => next(error));
  return null;
};

const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new ValidationError('Некорректный формат id карточки');
  }
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        throw new NoFoundError('Карточка не найдена');
      }
      if (card.owner.toString() !== req.user._id) {
        throw new NoRightsError('Вы не можете удалить карточку другого пользователя');
      }
      return Card.findByIdAndRemove(cardId)
        .then((deletedCard) => res.status(200).json({
          message: 'Карточка успешно удалена',
          deletedCard,
        }));
    })
    .catch((error) => next(error));
  return null;
};

const likeCard = (req, res, next) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new ValidationError('Некорректный формат id карточки');
  }

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .populate('likes')
    .then((card) => {
      if (!card) {
        throw new NoFoundError('Карточка не найдена');
      }

      return res.status(200).json(card);
    })
    .catch((error) => next(error));
  return null;
};

const dislikeCard = (req, res, next) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    throw new ValidationError('Некорректный формат id карточки');
  }

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .populate('likes')
    .then((card) => {
      if (!card) {
        throw new NoFoundError('Карточка не найдена');
      }

      return res.status(200).json(card);
    })
    .catch((error) => next(error));
  return null;
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
