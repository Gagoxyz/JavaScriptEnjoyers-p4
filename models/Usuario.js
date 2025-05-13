const mongoose = require('mongoose') // importamos mongoose

// definismo el Schema para el colección de "users"
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // evita generar duplicados
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, "Email inválido"],
  },
  password: {
    type: String,
    required: true,
    minlength: 4,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  }
})

const User = mongoose.model('User', userSchema, 'users') // asignamos una constante al Schema de User

module.exports = User // exportamos el Schema User
