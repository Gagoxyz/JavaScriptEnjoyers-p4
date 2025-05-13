const { MongoClient } = require("mongodb"); // Importamos MongoClient desde mongodb
const { users, cards } = require("./data/storage"); // Importamos los datos de usuarios y tarjetas desde storage.js

const uri = "mongodb://localhost:27017"; // URI de conexión a MongoDB local
const dbName = "voluntariado"; // Nombre de la base de datos

/**
 * Realiza la migración de datos a MongoDB.
 *
 * Esta función conecta a la base de datos, limpia las colecciones existentes
 * y carga nuevos datos desde el archivo `storage.js`.
 *
 * - Borra todos los documentos de las colecciones "users", "cards" y "usercards".
 * - Inserta usuarios con contraseñas hasheadas usando bcrypt.
 * - Inserta tarjetas directamente.
 *
 * @async
 * @function migrate
 * @throws {Error} Lanza un error si ocurre algún problema durante la conexión o migración.
 * @example
 * // Ejecutar la migración
 * node migrateToMongo.js
 */
async function migrate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    const usersCol = db.collection("users");
    const cardsCol = db.collection("cards");
    const userCards = db.collection("usercards");

    // Limpia datos anteriores de las colecciones
    await usersCol.deleteMany({});
    await cardsCol.deleteMany({});
    await userCards.deleteMany({});

    // Inserta los datos de storage.js
    const usersWithHashed = await Promise.all(users.map(async user => {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash(user.password, 10);
      return { ...user, password: hashedPassword };
    }));

    await usersCol.insertMany(usersWithHashed);
    await cardsCol.insertMany(cards);

    console.log("Migración completada con éxito.");
  } catch (err) {
    console.error("Error migrando:", err);
  } finally {
    await client.close();
  }
}

// Ejecutamos el proceso de migración
migrate();
