const express = require('express')
const { createHandler } = require("graphql-http/lib/use/express")
const schema = require('./graphql/schemaMongoose')
const resolvers = require('./graphql/resolversMongoose')
const { verifyToken, getUserFromToken } = require('./auth')
const { mongooseDB } = require('./db/connection')

const PORT = process.env.PORT || 3000
const route = "graphql"

const app = express()

// Middleware JSON
app.use(express.json())

// Ruta de prueba
app.get("/", (req, res) => res.send("Bienvenido a mi API GraphQL con Mongoose"))

// Conexión a MongoDB antes de levantar el servidor
mongooseDB().then(() => {
  // Middleware GraphQL
  app.use(
    "/" + route,
    createHandler({
      schema,
      rootValue: resolvers,
      context: async (req, res) => {
        const token = req.headers.authorization?.split(" ")[1]
        const userData = token ? verifyToken(token) : null
        const currentUser = getUserFromToken(token)
        return { user: userData, currentUser }
      },
    })
  )

  // Levantar el servidor
  app.listen(PORT, () =>
    console.log(`🚀 Servidor GraphQL listo en http://localhost:${PORT}/${route}`)
  )
})
