require('dotenv').config() // importamos dotenv para poder utilizar las variables de entorno
const mongoose = require('mongoose') // importamos mongoose

const uri = process.env.MONGO_URI // declaramos constante con con la URL de MongoDB-Atlas
const dbName = 'voluntariado'

// función asíncrona con la petición de conexión
async function mongooseDB() {
    if (mongoose.connection.readyState === 0) {
        try {
            await mongoose.connect(uri, { dbName })
            console.log('✅ ¡Conexión realizada con éxito con MongoDB-Atlas utilizando mongoose!')
        } catch (e) {
            console.error('Error de conexión: ', e)
            process.exit(1)
        }
    }
}

// exportamos la función asíncrona para la conexión
module.exports = { mongooseDB }