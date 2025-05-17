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
    socket.on("nuevo voluntariado",()=> {io.emit("actualizar voluntariados")});
    socket.on("voluntariado eliminado",()=> {io.emit("actualizar voluntariados")});
    socket.on("usuario añadido",()=> {io.emit("actualizar usuarios")});
    socket.on("usuario eliminado",()=> {io.emit("actualizar usuarios")});
    socket.on("usercard añadida",()=> {io.emit("actualizar usercards")});
    socket.on("usercard eliminada",()=> {io.emit("actualizar usercards")});



    // Definimos los eventos

    // Desconexión
    socket.on('disconnect', () => {
      console.log('🔴 Cliente desconectado:', socket.id)
    })
  })
})
