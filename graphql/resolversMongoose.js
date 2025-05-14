const bcrypt = require('bcryptjs')
const { ObjectId } = require('mongodb')
const { isValidObjectId } = require("mongoose")
const User = require('../models/Usuario')
const Card = require('../models/Voluntariado')
const UserCard = require('../models/SeleccionVoluntariados')
const auth = require('../auth')

const resolvers = {
    // Obtener todos los usuarios
    getUsers: async () => {
        return await User.find()
    },

    // Obtener todas las cards de voluntariado
    getCards: async () => {
        return await Card.find()
    },

    // Obtener un usuario por email
    userByEmail: async ({ email }) => {
        return await User.findOne({ email })
    },

    // Obtener tarjetas seleccionadas por el usuario autenticado
    getUserCards: async ({ currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        const userCards = await UserCard.findOne({ email: currentUser.email })
        if (!userCards) throw new Error("Usuario no tiene tarjetas seleccionadas")
        return userCards.selectedCards
    },

    // Obtener los datos del usuario autenticado
    currentUser: async (_, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        const user = await User.findOne({ email: currentUser.email })
        if (!user) throw new Error("Usuario no encontrado")

        console.log(currentUser)
        console.log(user)
        return user
    },

    // // Login: devuelve token si es correcto
    login: async ({ email, password }) => {
        const user = await User.findOne({ email })
        if (!user) throw new Error("Usuario no encontrado")

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) throw new Error("Contraseña incorrecta")

        const token = auth.generateToken({ email: user.email, role: user.role })

        return {
            message: "Autenticación exitosa",
            token
        }
    },

    // Crear un nuevo usuario
    createUser: async ({ input }) => {
        const existingUser = await User.findOne({ email: input.email })
        if (existingUser) throw new Error("Usuario ya existe")

        const hashedPassword = await bcrypt.hash(input.password, 10)

        // solo podrá asignar el rol de "admin" un usuario autenticado que tenga rol de "admin"
        if (input.role === "admin") {
            try {
                const creator = await User.findOne({ email: currentUser?.email })
                if (creator?.role === "admin") {
                    role = "admin"
                } else {
                    throw new Error("Solo los administradores pueden crear otros administradores")
                }
            } catch {
                throw new Error("Usuario no autenticado")
            }
        }
        const newUser = new User({ ...input, password: hashedPassword })
        await newUser.save()

        return "Usuario creado correctamente"
    },

    // Actualizar un usuario autenticado
    updateUser: async ({ input }, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        // Proteger contra intento de cambio de rol
        if ("role" in input) {
            throw new Error("No está permitido modificar el rol del usuario desde esta operación")
        }

        if (input.password && typeof input.password === 'string') {
            input.password = await bcrypt.hash(input.password, 10)
        }

        await User.updateOne({ email: currentUser.email }, { $set: input })
        return `Usuario con email ${currentUser.email} actualizado correctamente`
    },

    // Eliminar el usuario autenticado
    deleteUser: async ({ email }, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        // Verificar si quien ejecuta la acción es admin
        const dbUser = await User.findOne({ email: currentUser.email })
        if (dbUser.role !== "admin") throw new Error("Acceso denegado: requiere rol admin")

        // Verificar si el usuario a eliminar existe
        const targetUser = await User.findOne({ email })
        if (!targetUser) throw new Error("Usuario a eliminar no encontrado")

        // No dejar que un admin se elimine a sí mismo (opcional)
        if (email === currentUser.email) {
            throw new Error("No puedes eliminarte a ti mismo desde esta operación")
        }

        await User.deleteOne({ email })
        return `Usuario con email ${email} eliminado correctamente`
    },

    // Crear un nuevo voluntariado (tarjeta, card)
    createCard: async ({ input }) => {
        const user = await User.findOne({ email: input.email });

        if (!user) throw new Error("Usuario (email) del voluntariado no encontrado");

        if (user.name !== input.autor) {
            throw new Error("No corresponde el autor del voluntariado con el usuario (email)");
        }

        if (input.volunType && !["Oferta", "Petición"].includes(input.volunType)) {
            throw new Error("Tipo de voluntariado incorrecto, debe ser 'Oferta' o 'Petición'");
        }

        const newCard = new Card(input);
        await newCard.save();

        return newCard;
    },


    // Actualida los datos de un voluntariado
    updateCard: async ({ cardId, input }) => {
        if (!isValidObjectId(cardId)) {
            throw new Error("ID de voluntariado inválido");
        }

        if (!input.email || !input.autor) {
            throw new Error("Se requiere email y autor para actualizar el voluntariado");
        }

        const user = await User.findOne({ email: input.email });

        if (!user) throw new Error("Usuario (email) del voluntariado no encontrado");

        if (user.name !== input.autor) {
            throw new Error("No corresponde el autor del voluntariado con el usuario (email)");
        }

        if (input.volunType && !["Oferta", "Petición"].includes(input.volunType)) {
            throw new Error("Tipo de voluntariado incorrecto, debe ser 'Oferta' o 'Petición'");
        }

        const updatedCard = await Card.findByIdAndUpdate(
            cardId,
            { $set: input },
            { new: true }
        );

        if (!updatedCard) throw new Error("Voluntariado no encontrado");

        return "Voluntariado actualizado correctamente";
    },

    // Elimina un voluntariado
    deleteCard: async ({ cardId }) => {
        if (!isValidObjectId(cardId)) {
            throw new Error("ID de voluntariado inválido");
        }

        const card = await Card.findById(cardId);
        if (!card) throw new Error("No se ha encontrado el ID del voluntariado");

        await Card.findByIdAndDelete(cardId);

        return `Voluntariado con ID ${cardId} eliminado correctamente`;
    },

    // Añadir una tarjeta seleccionada al usuario autenticado
    addUserCard: async ({ cardId }, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        const user = await User.findOne({ email: currentUser.email })
        if (!user) throw new Error("Usuario no encontrado")

        const card = await Card.findById(cardId)
        if (!card) throw new Error("Card no encontrada")

        let userCards = await UserCard.findOne({ email: currentUser.email })

        if (userCards) {
            const exists = userCards.selectedCards.some(
                c => String(c._id) === String(card._id)
            )
            if (!exists) {
                userCards.selectedCards.push(card)
                await userCards.save()
            }
        } else {
            userCards = new UserCard({
                email: currentUser.email,
                selectedCards: [card]
            })
            await userCards.save()
        }

        return "Voluntariado añadido a la selección correctamente"
    },

    // Eliminar una tarjeta seleccionada del usuario autenticado
    deleteUserCard: async ({ cardId }, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        const userCards = await UserCard.findOne({ email: currentUser.email })
        if (!userCards) throw new Error("No se encontró el usuario")

        const objectId = new ObjectId(cardId)
        const exists = userCards.selectedCards.some(
            c => String(c._id) === String(objectId)
        )

        if (!exists) throw new Error("El voluntariado no fue seleccionado para este usuario")

        await UserCard.updateOne(
            { email: currentUser.email },
            { $pull: { selectedCards: { _id: objectId } } }
        )

        return "Voluntariado eliminado de la selección correctamente"
    }
}

module.exports = resolvers