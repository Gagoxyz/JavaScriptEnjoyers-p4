require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI; // Asegúrate de tener la URI en .env
const dbName = 'voluntariado'; // Ajusta si usas otro nombre de base de datos

// Conectamos a MongoDB usando Mongoose
mongoose.connect(uri, { dbName })
  .then(() => {
    console.log('✅ Conectado a MongoDB Atlas');

    const userSchema = new mongoose.Schema({}, { strict: false }); // Ignora validaciones de schema
    const User = mongoose.model('User', userSchema, 'users'); // 3er argumento: nombre exacto de la colección

    const actualizarRoles = async () => {
      try {
        // 1. Establecer role: "admin" para el usuario dgago@uoc.edu
        await User.updateOne(
          { email: "dgago@uoc.edu" },
          { $set: { role: "admin" } }
        );

        // 2. Establecer role: "user" para todos los demás usuarios
        await User.updateMany(
          { email: { $ne: "dgago@uoc.edu" } },
          { $set: { role: "user" } }
        );

        console.log("✅ Roles actualizados correctamente");
      } catch (err) {
        console.error("❌ Error al actualizar los roles:", err);
      } finally {
        mongoose.disconnect();
      }
    };

    actualizarRoles();
  })
  .catch(err => {
    console.error('❌ Error al conectar con MongoDB:', err);
  });
