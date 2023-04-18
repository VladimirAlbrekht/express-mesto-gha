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
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

const deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    .then(card => {
      if (!card) {
        return res.status(404).send({ message: 'Карточка не найдена' });
      }

      res.send(card);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
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
      res.status(500).send({ message: err.message });
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
      res.status(500).send({ message: err.message });
    });
};



module.exports = {getCards, createCard, deleteCard, likeCard, dislikeCard};