const mongoose = require('mongoose');
const Card = require('../models/card');

const ValidationError = require('../errors/validationError');
const NoFoundError = require('../errors/noFoundError');
const NoRightsError = require('../errors/noRightsError');
const ServerError = require('../errors/serverError');

const getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .populate('likes')
    .then((cards) => {
      res.send(cards);
    })
    .catch((err) => {
      res.status(ServerError.statusCode).send({ message: err.message });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.status(ServerError.statusCode).send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ValidationError.statusCode).send({ message: err.message });
      } else {
        res.status(ServerError.statusCode).send({ message: err.message });
      }
    });
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(ValidationError.statusCode).send({ message: 'Некорректный формат id карточки' });
  }
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return res.status(NoFoundError.statusCode).send({ message: 'Карточка не найдена' });
      }
      if (card.owner.toString() !== req.user._id) {
        return res.status(NoRightsError.statusCode).send({ message: 'Вы не можете удалить карточку другого пользователя' });
      }
      return Card.findByIdAndRemove(cardId)
        .then((deletedCard) => res.status(ServerError.statusCode).send({
          message: 'Карточка успешно удалена',
          deletedCard,
        }));
    })
    .catch((err) => {
      res.status(ServerError.statusCode).send({ message: `Ошибка при удалении карточки: ${err}` });
    });
  return null;
};

const likeCard = (req, res) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(ValidationError.statusCode).send({ message: 'Некорректный формат id карточки' });
  }

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .populate('likes')
    .then((card) => {
      if (!card) {
        return res.status(NoFoundError.statusCode).send({ message: 'Карточка не найдена' });
      }

      return res.status(ServerError.statusCode).send(card);
    })
    .catch((err) => {
      res.status(ServerError.statusCode).send({ message: err.message });
    });
  return null;
};

const dislikeCard = (req, res) => {
  const { cardId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(ValidationError.statusCode).send({ message: 'Некорректный формат id карточки' });
  }

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .populate('likes')
    .then((card) => {
      if (!card) {
        return res.status(NoFoundError.statusCode).send({ message: 'Карточка не найдена' });
      }

      return res.status(ServerError.statusCode).send(card);
    })
    .catch((err) => {
      res.status(ServerError.statusCode).send({ message: err.message });
    });
  return null;
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
