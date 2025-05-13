const bcrypt = require('bcryptjs')
const { ObjectId } = require('mongodb')

const User = require('../models/Usuario')
const Card = require('../models/Voluntariado')
const UserCard = require('../models/SeleccionVoluntariados')
const auth = require('../auth')

const resolversMongoose = {
    Query: {
        // Obtener todos los usuarios
        getUsers: async () => {
            return await User.find()
        },

        // Obtener todas las cards de voluntariado
        getCards: async () => {
            return await Card.find()
        },

        // Obtener un usuario por email
        userByEmail: async (_, { email }) => {
            return await User.findOne({ email })
        },

        // Obtener tarjetas seleccionadas por el usuario autenticado
        getUserCards: async (_, __, { currentUser }) => {
            if (!currentUser?.email) throw new Error("No autenticado")

            const userCards = await UserCard.findOne({ email: currentUser.email })
            if (!userCards) throw new Error("Usuario no tiene tarjetas seleccionadas")
            return userCards.selectedCards
        },

        // Obtener los datos del usuario autenticado
        currentUser: async (_, __, { currentUser }) => {
            if (!currentUser?.email) throw new Error("No autenticado")

            const user = await User.findOne({ email: currentUser.email })
            if (!user) throw new Error("Usuario no encontrado")

            return user
        }
    },

    Mutation: {
        // Login: devuelve token si es correcto
        login: async (_, { email, password }) => {
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
        createUser: async (_, { input }) => {
            const existingUser = await User.findOne({ email: input.email })
            if (existingUser) throw new Error("Usuario ya existe")

            const hashedPassword = await bcrypt.hash(input.password, 10)

            // let role = "user" // asignamos rol por defecto de "user"

            // // solo podrá asignar el rol de "admin" un usuario autenticado que tenga rol de "admin"
            // if (input.role === "admin") {
            //     const creator = await User.findOne({ email: currentUser?.email })
            //     if (creator?.role === "admin") {
            //         role = "admin"
            //     } else {
            //         throw new Error("Solo los administradores pueden crear otros administradores")
            //     }
            // }
            const newUser = new User({ ...input, password: hashedPassword })
            await newUser.save()

            return "Usuario creado correctamente"
        },

        // Actualizar un usuario autenticado
        updateUser: async (_, { input }, { currentUser }) => {
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
        deleteUser: async (_, __, { currentUser }) => {
            if (!currentUser?.email) throw new Error("No autenticado")

            // verifica si el usuario activo tiene el rol de "admin"
            const dbUser = await User.findOne({ email: currentUser.email })
            if (dbUser.role !== "admin") throw new Error("Acceso denegado: requiere rol admin")

            await User.deleteOne({ email: currentUser.email })
            return `Usuario con email ${currentUser.email} eliminado correctamente`
        },

        // Añadir una tarjeta seleccionada al usuario autenticado
        addUserCard: async (_, { cardId }, { currentUser }) => {
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
        deleteUserCard: async (_, { cardId }, { currentUser }) => {
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
}

module.exports = resolversMongoose
