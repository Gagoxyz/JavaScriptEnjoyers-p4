const mongoose = require('mongoose') // Importamos mongoose

// gestiona las tarjetas de voluntariado seleccionadas por cada usuario.
const selectedCardsSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // Asegura que cada usuario tenga solo un conjunto de tarjetas
      lowercase: true,
      trim: true,
    },
    selectedCards: [
      {
        type: mongoose.Schema.Types.ObjectId, // Tipo de dato ObjectId, que es la referencia de la tarjeta
        ref: 'Card', // Relación con el modelo Card
        required: true,
      }
    ],
  }
)

// Creamos el modelo de UserCard con el esquema definido
const SelectedCards = mongoose.model('SelectedCards', selectedCardsSchema)

module.exports = SelectedCards
