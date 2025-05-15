const express = require('express')
const { createHandler } = require("graphql-http/lib/use/express")
const schema = require('./graphql/schemaMongoose')
const resolvers = require('./graphql/resolversMongoose')
const { verifyToken, getUserFromToken } = require('./auth')
const { mongooseDB } = require('./db/connection')
const path = require('path')

const PORT = process.env.PORT || 3000
const route = "graphql"

const app = express()

// Middleware JSON
app.use(express.json())

// Servir archivos estáticos de /public
app.use(express.static(path.join(__dirname, 'public')))
app.use('/assets', express.static(path.join(__dirname, 'assets')))

// Ruta raíz del proyecto
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

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
        const currentUser = token ? getUserFromToken(token) : null
        return { currentUser }
      },
    })
  )

  // Levantar el servidor
  app.listen(PORT, () =>
    console.log(`🚀 Servidor GraphQL listo en http://localhost:${PORT}/${route}`)
  )
})
