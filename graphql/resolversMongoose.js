const bcrypt = require('bcryptjs')
const { ObjectId } = require('mongodb')
const mongoose = require("mongoose")
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
    // getUserCards: async (_, { currentUser }) => {
    //     if (!currentUser?.email) throw new Error("No autenticado")

    //     const userCards = await UserCard.findOne({ email: currentUser.email })
    //     //if (!userCards) throw new Error("Usuario no tiene tarjetas seleccionadas")
    //     return userCards.selectedCards || []
    // },
    getUserCards: async (_, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        const userCards = await UserCard.findOne({ email: currentUser.email }).populate("selectedCards")

        if (!userCards) return [] // <- Devuelve array vacío si no hay documento

        return userCards.selectedCards || [].filter(Boolean)
    },

    // Obtener tarjetas de voluntariado del usuario activo
    getCardsByCurrentUser: async (_, { currentUser }) => {
        if (!currentUser || !currentUser.email) {
            throw new Error("No autenticado")
        }

        const cards = await Card.find({ email: currentUser.email })
        return cards
    },

    // Obtener los datos del usuario autenticado
    currentUser: async (_, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        const user = await User.findOne({ email: currentUser.email })
        if (!user) throw new Error("Usuario no encontrado")

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
    createUser: async ({ input }, { currentUser }) => {
        const existingUser = await User.findOne({ email: input.email })
        if (existingUser) throw new Error("Usuario ya existe")

        const hashedPassword = await bcrypt.hash(input.password, 10)

        // Si se intenta crear un usuario con rol "admin"
        if (input.role === "admin") {
            if (!currentUser?.email) {
                throw new Error("Usuario no autenticado")
            }

            const creator = await User.findOne({ email: currentUser.email })
            if (!creator || creator.role !== "admin") {
                throw new Error("Solo los administradores pueden crear otros administradores")
            }
        } else {
            // Elimina el campo "role" si no es admin para que se aplique el valor por defecto del modelo
            delete input.role
        }

        const newUser = new User({
            ...input,
            password: hashedPassword,
        })

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

    // Crear un nuevo voluntariado (solo el propio usuario puede crear uno)
    createCard: async ({ input }, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        if (currentUser.email !== input.email) {
            throw new Error("Solo puedes crear voluntariados con tu propio email")
        }

        const user = await User.findOne({ email: currentUser.email })
        if (!user) throw new Error("Usuario autenticado no encontrado")

        if (user.name !== input.autor) {
            throw new Error("El autor no corresponde con el usuario autenticado")
        }

        if (input.volunType && !["Oferta", "Petición"].includes(input.volunType)) {
            throw new Error("Tipo de voluntariado incorrecto, debe ser 'Oferta' o 'Petición'")
        }

        const newCard = new Card(input)
        await newCard.save()

        return newCard
    },

    // Actualiza los datos de un voluntariado
    updateCard: async ({ cardId, input }, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        if (!isValidObjectId(cardId)) {
            throw new Error("ID de voluntariado inválido")
        }

        const card = await Card.findById(cardId)
        if (!card) throw new Error("Voluntariado no encontrado")

        const dbUser = await User.findOne({ email: currentUser.email })
        if (!dbUser) throw new Error("Usuario autenticado no encontrado")

        const isAdmin = dbUser.role === "admin"
        const isOwner = card.email === currentUser.email

        if (!isAdmin && !isOwner) {
            throw new Error("Solo puedes modificar tus propios voluntariados")
        }

        if (input.volunType && !["Oferta", "Petición"].includes(input.volunType)) {
            throw new Error("Tipo de voluntariado incorrecto, debe ser 'Oferta' o 'Petición'")
        }

        await Card.findByIdAndUpdate(cardId, { $set: input })

        return "Voluntariado actualizado correctamente"
    },

    // Elimina un voluntariado
    deleteCard: async ({ cardId }, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        if (!isValidObjectId(cardId)) {
            throw new Error("ID de voluntariado inválido")
        }

        const card = await Card.findById(cardId)
        if (!card) throw new Error("Voluntariado no encontrado")

        const dbUser = await User.findOne({ email: currentUser.email })
        if (!dbUser) throw new Error("Usuario autenticado no encontrado")

        const isAdmin = dbUser.role === "admin"
        const isOwner = card.email === currentUser.email

        if (!isAdmin && !isOwner) {
            throw new Error("Solo puedes eliminar tus propios voluntariados")
        }

        await Card.findByIdAndDelete(cardId)

        return `Voluntariado con ID ${cardId} eliminado correctamente`
    },

    // // Añadir una tarjeta seleccionada al usuario autenticado
    // addUserCard: async ({ cardId }, { currentUser }) => {
    //     if (!currentUser?.email) throw new Error("No autenticado")

    //     const user = await User.findOne({ email: currentUser.email })
    //     if (!user) throw new Error("Usuario no encontrado")

    //     const card = await Card.findById(cardId)
    //     if (!card) throw new Error("Card no encontrada")

    //     let userCards = await UserCard.findOne({ email: currentUser.email })

    //     if (userCards) {
    //         const exists = userCards.selectedCards.some(
    //             c => String(c._id) === String(card._id)
    //         )
    //         if (!exists) {
    //             userCards.selectedCards.push(card._id)
    //             await userCards.save()
    //         }
    //     } else {
    //         userCards = new UserCard({
    //             email: currentUser.email,
    //             selectedCards: [card]
    //         })
    //         await userCards.save()
    //     }

    //     return "Voluntariado añadido a la selección correctamente"
    // },

    addUserCard: async ({ cardId }, { currentUser }) => {
        if (!currentUser?.email) throw new Error("No autenticado")

        if (!cardId || !mongoose.Types.ObjectId.isValid(cardId)) {
            throw new Error("ID de tarjeta inválido")
        }

        const user = await User.findOne({ email: currentUser.email })
        if (!user) throw new Error("Usuario no encontrado")

        const card = await Card.findById(cardId)
        if (!card) throw new Error("Card no encontrada")

        let userCards = await UserCard.findOne({ email: currentUser.email })

        if (userCards) {
            const exists = userCards.selectedCards.some(
                c => String(c.id) === String(card._id)
            )
            if (!exists) {
                userCards.selectedCards.push(card._id) // solo guarda el ID
                await userCards.save()
            }
        } else {
            userCards = new UserCard({
                email: currentUser.email,
                selectedCards: [card._id] // solo IDs aquí también
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
            { $pull: { selectedCards: objectId } }
        )

        return "Voluntariado eliminado de la selección correctamente"
    }
}

module.exports = resolvers