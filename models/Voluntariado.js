const mongoose = require('mongoose')

const cardSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true, // limpia espacios innecesarios, ej: "  Título de   voluntariado  ", lo dejaría "Título de voluntariado"
  },
  description: {
    type: String,
    required: true,
  },
  autor: {
    type: String,
    required: true,
  },
  volunType: {
    type: String,
    enum: ['Oferta', 'Petición'],
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/.+@.+\..+/, "Email inválido"],
  }
})

const Card = mongoose.model('Card', cardSchema)

module.exports = Card
