const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

router.get('/', cardController.getAllCards);
router.post('/by-email', cardController.getCardsByEmail);
router.post('/by-type', cardController.getCardsByType);
router.post('/', cardController.createCard);
router.put('/', cardController.updateCard);
router.delete('/', cardController.deleteCard);

module.exports = router;
