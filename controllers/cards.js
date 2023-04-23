const mongoose = require('mongoose');
const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .populate('owner')
    .populate('likes')
    .then(cards => {
      res.send(cards);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then(card => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;
  console.log(cardId);
  if (!mongoose.Types.ObjectId.isValid(cardId)) {
    return res.status(400).send({ message: 'Некорректный формат id карточки' });
  }
  Card.findByIdAndRemove(cardId)
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }
      return res.send({ message: 'Карточка успешно удалена', card });
    })
    .catch((err) => {
      return res.status(500).send({ message: `Ошибка при удалении карточки: ${err}` });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true }
  )
    .populate('likes')
    .then(card => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }

      res.send(card);
    })
    .catch(err => {
      res.status(400).send({ message: err.message });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true }
  )
    .populate('likes')
    .then(card => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }

      res.send(card);
    })
    .catch(err => {
      res.status(400).send({ message: err.message });
    });
};



module.exports = {getCards, createCard, deleteCard, likeCard, dislikeCard};