const { cards } = require('../data/storage');

// Read
exports.getAllCards = (req, res) => res.json(cards);
exports.getCardsByEmail = (req, res) => {
  const { email } = req.body;
  res.json(cards.filter(card => card.email === email));
};
exports.getCardsByType = (req, res) => {
  const { type } = req.body;
  res.json(cards.filter(card => card.volunType.toLowerCase() === type.toLowerCase()));
};

// Create
exports.createCard = (req, res) => {
  const { date, title, description, autor, volunType, email } = req.body;
  cards.push({ date, title, description, autor, volunType, email });
  res.status(201).json({ message: 'Card creada correctamente' });
};

// Update
exports.updateCard = (req, res) => {
  const { title, email, newData } = req.body;
  const card = cards.find(c => c.title === title && c.email === email);
  if (!card) return res.status(404).json({ message: 'No encontrada' });
  Object.assign(card, newData);
  res.json({ message: 'Actualizada correctamente' });
};

// Delete
exports.deleteCard = (req, res) => {
  const { title, email } = req.body;
  const index = cards.findIndex(c => c.title === title && c.email === email);
  if (index === -1) return res.status(404).json({ message: 'No encontrada' });
  cards.splice(index, 1);
  res.json({ message: 'Eliminada correctamente' });
};
