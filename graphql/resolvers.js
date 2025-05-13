const { connectDB } = require("../mongo"); // Importa la función para conectar con MongoDB
const { generateToken } = require("../auth"); // Importa la función para generar JWT
const { ObjectId } = require('mongodb'); // Importa ObjectId para manejo de IDs en MongoDB
const bcrypt = require("bcryptjs"); // Importa bcrypt para hashear contraseñas

/**
 * Resolvers para las operaciones de la API GraphQL.
 *
 * @module resolvers
 */
const resolvers = {

  /**
   * Obtiene todos los usuarios.
   * @returns {Promise<Array>} Lista de usuarios.
   */
  getUsers: async () => {
    const db = await connectDB();
    return await db.collection("users").find().toArray();
  },

  /**
   * Obtiene todas las cards de voluntariado.
   * @returns {Promise<Array>} Lista de cards.
   */
  getCards: async () => {
    const db = await connectDB();
    return await db.collection("cards").find().toArray();
  },

  /**
   * Obtiene un usuario por su email.
   * @param {Object} param0
   * @param {string} param0.email - Email del usuario.
   * @returns {Promise<Object|null>} Usuario encontrado o null.
   */
  userByEmail: async ({ email }) => {
    const db = await connectDB();
    return await db.collection("users").findOne({ email });
  },

  /**
   * Obtiene todas las cards asociadas a un email.
   * @param {Object} param0
   * @param {string} param0.email - Email del autor.
   * @returns {Promise<Array>} Lista de cards asociadas.
   */
  cardsByEmail: async ({ email }) => {
    const db = await connectDB();
    return await db.collection("cards").find({ email }).toArray();
  },

  /**
   * Obtiene cards por tipo de voluntariado.
   * @param {Object} param0
   * @param {string} param0.volunType - Tipo de voluntariado ('Oferta' o 'Petición').
   * @returns {Promise<Array>} Lista de cards filtradas por tipo.
   */
  cardsByType: async ({ volunType }) => {
    const db = await connectDB();
    return await db.collection("cards").find({ volunType }).toArray();
  },

  /**
   * Crea un nuevo usuario.
   * @param {Object} param0
   * @param {Object} param0.input - Datos del usuario.
   * @returns {Promise<string>} Mensaje de confirmación.
   */
  createUser: async ({ input }) => {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const existingUser = await usersCollection.findOne({ email: input.email });
    if (existingUser) throw new Error("Usuario ya existe");

    const hashedPassword = await bcrypt.hash(input.password, 10);

    const newUser = {
      name: input.name,
      email: input.email,
      password: hashedPassword
    };

    await usersCollection.insertOne(newUser);
    return 'Usuario registrado correctamente';
  },

  /**
   * Actualiza un usuario existente.
   * @param {Object} param0
   * @param {string} param0.email - Email del usuario a actualizar.
   * @param {Object} param0.input - Nuevos datos del usuario.
   * @returns {Promise<string>} Mensaje de confirmación.
   */
  updateUser: async ({ email, input }) => {
    const db = await connectDB();
    const existingUser = await db.collection("users").findOne({ email });

    if (!existingUser) throw new Error("Usuario no encontrado");

    await db.collection("users").findOneAndUpdate(
      { email },
      { $set: input },
      { returnDocument: "after" }
    );

    return `Usuario ${email} actualizado correctamente`;
  },

  /**
   * Elimina un usuario por su email.
   * @param {Object} param0
   * @param {string} param0.email - Email del usuario a eliminar.
   * @returns {Promise<string>} Mensaje de confirmación.
   */
  deleteUser: async ({ email }) => {
    const db = await connectDB();
    const userExists = await db.collection("users").findOne({ email });

    if (!userExists) throw new Error("Usuario no existe");

    await db.collection("users").deleteOne({ email });

    return `Usuario con email ${email} eliminado correctamente`;
  },

  /**
   * Crea una nueva card de voluntariado.
   * @param {Object} param0
   * @param {Object} param0.input - Datos de la card.
   * @returns {Promise<Object>} Card creada.
   */
  createCard: async ({ input }) => {
    const db = await connectDB();
    const user = await db.collection("users").findOne({ email: input.email });

    if (!user) throw new Error("Usuario (email) del voluntariado no encontrado");

    if (user.name !== input.autor) {
      throw new Error("No corresponde el autor del voluntariado con el usuario (email)");
    }

    if (input.volunType && !["Oferta", "Petición"].includes(input.volunType)) {
      throw new Error("Tipo de voluntariado incorrecto, debe ser 'Oferta' o 'Petición'");
    }

    await db.collection("cards").insertOne(input);

    return input;
  },

  /**
   * Actualiza una card de voluntariado existente.
   * @param {Object} param0
   * @param {string} param0.cardId - ID de la card.
   * @param {Object} param0.input - Nuevos datos de la card.
   * @returns {Promise<string>} Mensaje de confirmación.
   */
  updateCard: async ({ cardId, input }) => {
    const db = await connectDB();

    if (!ObjectId.isValid(cardId)) {
      throw new Error("ID de voluntariado inválido");
    }

    if (input.email && input.autor) {
      const user = await db.collection("users").findOne({ email: input.email });

      if (!user) throw new Error("Usuario (email) del voluntariado no encontrado");
      if (user.name !== input.autor) {
        throw new Error("No corresponde el autor del voluntariado con el usuario (email)");
      }
    } else {
      throw new Error("Se requiere email y autor para actualizar el voluntariado");
    }

    if (input.volunType && !["Oferta", "Petición"].includes(input.volunType)) {
      throw new Error("Tipo de voluntariado incorrecto, debe ser 'Oferta' o 'Petición'");
    }

    await db.collection("cards").findOneAndUpdate(
      { _id: new ObjectId(cardId) },
      { $set: input },
      { returnDocument: "after" }
    );

    return "Voluntariado actualizado correctamente";
  },

  /**
   * Elimina una card por su ID.
   * @param {Object} param0
   * @param {string} param0.cardId - ID de la card.
   * @returns {Promise<string>} Mensaje de confirmación.
   */
  deleteCard: async ({ cardId }) => {
    const db = await connectDB();
    const cardExists = await db.collection("cards").findOne({ _id: new ObjectId(cardId) });

    if (!cardExists) throw new Error('No se ha encontrado el ID del voluntariado');

    await db.collection("cards").deleteOne({ _id: new ObjectId(cardId) });

    return `Voluntariado con ID ${cardId} eliminado correctamente`;
  },

  /**
   * Login de usuario (retorna token).
   * @param {Object} param0
   * @param {string} param0.email - Email del usuario.
   * @param {string} param0.password - Contraseña del usuario.
   * @returns {Promise<string>} Token JWT.
   */
  login: async ({ email, password }) => {
    const db = await connectDB();
    const user = await db.collection("users").findOne({ email });

    if (!user) throw new Error("Usuario no encontrado");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Contraseña incorrecta");

    return 'Usuario autenticado correctamente, token -> ' + generateToken(user);
  },

  /**
   * Obtiene el usuario actualmente autenticado.
   * @param {any} _args - No se usa.
   * @param {Object} context - Contexto con usuario autenticado.
   * @returns {Promise<Object>} Usuario actual.
   */
  currentUser: async (_args, context) => {
    if (!context.currentUser) throw new Error("No autenticado");

    const db = await connectDB();
    const user = await db.collection("users").findOne({ email: context.currentUser.email });

    if (!user) throw new Error("Usuario no encontrado");

    return user;
  },

  /**
   * Obtiene las cards seleccionadas por un usuario.
   * @param {Object} param0
   * @param {string} param0.email - Email del usuario.
   * @returns {Promise<Object>} Cards seleccionadas.
   */
  getUserCards: async ({ email }) => {
    const db = await connectDB();
    const userCards = await db.collection('usercards').findOne({ email });

    if (!userCards) throw new Error('Usuario no tiene selección de voluntariados');

    return userCards;
  },

  /**
   * Añade una card seleccionada para un usuario.
   * @param {Object} param0
   * @param {string} param0.email - Email del usuario.
   * @param {string} param0.cardId - ID de la card.
   * @returns {Promise<string>} Mensaje de confirmación.
   */
  addUserCard: async ({ email, cardId }) => {
    const db = await connectDB();
    const collection = db.collection('usercards');
    const collectionUsers = db.collection('users');
    const collectionCards = db.collection('cards');
    const user = await collectionUsers.findOne({ email });
    const card = await collectionCards.findOne({ _id: new ObjectId(cardId) });
    const userCards = await collection.findOne({ email });

    if (userCards) {
      const exists = userCards.selectedCards.some(c => c._id.toString() === card._id.toString());
      if (!exists) {
        await collection.updateOne(
          { email },
          { $push: { selectedCards: card } }
        );
      }
    } else if (user) {
      await collection.insertOne({
        email,
        selectedCards: [card],
      });
    }

    return "Voluntariado añadido a la selección correctamente";
  },

  /**
   * Elimina una card de la selección de un usuario.
   * @param {Object} param0
   * @param {string} param0.email - Email del usuario.
   * @param {string} param0.cardId - ID de la card.
   * @returns {Promise<string>} Mensaje de confirmación.
   */
  deleteUserCard: async ({ email, cardId }) => {
    const db = await connectDB();
    const collection = db.collection('usercards');
    const userCards = await collection.findOne({ email });

    if (!userCards) {
      throw new Error('No se encontró el usuario');
    }

    const objectId = new ObjectId(cardId);
    const exists = userCards.selectedCards.some(c => c._id.toString() === objectId.toString());

    if (!exists) {
      throw new Error('El voluntariado no fue seleccionado para este usuario');
    }

    await collection.updateOne(
      { email },
      { $pull: { selectedCards: { _id: objectId } } }
    );

    return "Voluntariado eliminado de la selección correctamente";
  },
};

module.exports = resolvers;
