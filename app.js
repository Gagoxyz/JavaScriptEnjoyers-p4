const express = require('express')
const { createHandler } = require("graphql-http/lib/use/express")
const schema = require('./graphql/schemaMongoose')
const resolvers = require('./graphql/resolversMongoose')
const { getUserFromToken } = require('./auth')
const { mongooseDB } = require('./db/connection')
const path = require('path')
const { createServer } = require('http')
const { Server } = require('socket.io')

const PORT = process.env.PORT || 3000
const route = "graphql"

const app = express()
const server = createServer(app)
const io = new Server(server)

// Exportamos IO
app.set("io", io)

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
        return { currentUser, io }
      },
    })
  )

  // Levantar el servidor
  server.listen(PORT, () =>
    console.log(`🚀 Servidor GraphQL listo en http://localhost:${PORT}/${route}`)
  )

  // Conexión con SocketIO
  io.on('connection', (socket) => {
    console.log('🟢 Nuevo cliente conectado:', socket.id)

    // Definimos los eventos
    socket.on('nueva-publicacion', (data) => {
      console.log('📣 Nueva publicación recibida:', data)

      // Emitir a todos los clientes conectados
      io.emit('actualizar-publicaciones', data)
    })

    // Desconexión
    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado:', socket.id)
    })
  })
})
