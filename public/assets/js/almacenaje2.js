import { graphqlRequest } from "./graphClient.js"

//Mostrar el usuario activo
export function showActiveUser() {
  const domUserLogged = document.getElementById("activeUser")
  const user = localStorage.getItem("activeUser")

  if (user) {
    domUserLogged.textContent = user
  } else {
    domUserLogged.textContent = "-no login-"
  }
}

//Autenticar usuario
export async function loginUser(event) {
  event.preventDefault()

  const domInputEmail = document.getElementById("loginInputEmail")
  const domInputPassword = document.getElementById("loginInputPassword")

  const email = domInputEmail.value
  const password = domInputPassword.value

  if (!email || !password) {
    alert("Por favor, completa ambos campos.")
    return
  }

  const query = `
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
      }
    }
  `

  const variables = { email, password }

  try {
    const data = await graphqlRequest(query, variables)
    const token = data.login.token

    // Guardamos el token en localStorage
    localStorage.setItem("token", token)

    // Opcional: llamamos a currentUser para guardar el usuario completo
    const currentUser = await getCurrentUser(token)

    if (!currentUser || !currentUser.email) {
      alert("Error: no se pudo obtener el usuario actual")
      return
    }

    localStorage.setItem("activeUser", JSON.stringify(currentUser.email))

    alert("Inicio de sesión exitoso")

    window.location.reload()
    showActiveUser()

  } catch (error) {
    alert("Error al iniciar sesión: " + error.message)
    console.error("Login error:", error)
  }
}

//Obtiene el usuario activo
export async function getCurrentUser(token) {
  const query = `
    query {
      currentUser {
        name
        email
        password
        role
      }
    }
  `

  const data = await graphqlRequest(query, {}, token)

  if (!data || !data.currentUser) {
    throw new Error("No se pudo obtener el usuario actual")
  }

  return data.currentUser
}

// Mostrar registros de "users" en una tabla
export async function showUsersTable() {
  const table = document.getElementById("userTableId")
  const token = localStorage.getItem("token")

  // Limpiar la tabla antes de llenarla
  table.innerHTML = `
    <tr>
        <th scope="col">Nombre</th>
        <th scope="col">Email</th>
        <th scope="col">Password</th>
        <th scope="col">Rol</th>
        <th scope="col">Acciones</th>
    </tr>
  `

  const currentUser = await getCurrentUser(token)

  if (!currentUser) {
    console.error("No se pudo obtener el usuario actual.")
    return
  }

  const role = currentUser.role

  try {
    if (role === "admin") {
      // Si es admin, mostramos todos los usuarios
      const query = `
        query {
          getUsers {
            name
            email
            password
            role
          }
        }
      `
      const data = await graphqlRequest(query, {}, token)
      const users = data.getUsers

      for (let user of users) {
        addUserRow(user)
      }
    } else {
      // Si es un usuario normal, solo se muestra a sí mismo
      addUserRow(currentUser)
    }

  } catch (error) {
    console.error("No se pudieron cargar los usuarios:", error)
  }
}

//Añadir filas en una tabla
function addUserRow(user) {
  const table = document.getElementById("userTableId")
  let newRow = table.insertRow()
  let cell1 = newRow.insertCell(0)
  let cell2 = newRow.insertCell(1)
  let cell3 = newRow.insertCell(2)
  let cell4 = newRow.insertCell(3)
  let cell5 = newRow.insertCell(4)

  cell1.textContent = user.name
  cell2.textContent = user.email
  cell3.textContent = user.password.slice(0, 8) + '...'
  cell4.textContent = user.role
  cell5.innerHTML = `<button type="button" class="btn btn-danger user-delete-button" data-email="${user.email}">Eliminar</button>`
}

// evento para eliminar un usuario con el "click"
document.addEventListener("click", async function (event) {
  if (event.target.classList.contains("user-delete-button")) {
    let userEmail = event.target.getAttribute("data-email")
    let confirmDelete = confirm("¿Estás seguro que deseas eliminar este usuario?")

    if (confirmDelete) {
      deleteUser(userEmail)
    }
  }
})

//Elimina un usuario de la base de datos
async function deleteUser(email) {
  const query = `
    mutation DeleteUser($email: String!) {
      deleteUser(email: $email)
    }
  `
  const variables = { email }
  const token = localStorage.getItem("token")

  try {
    await graphqlRequest(query, variables, token)
    alert("Usuario eliminado correctamente")

    showUsersTable()
  } catch (error) {
    alert(error.message)
  }
}

//Añadir un nuevo usuario
export async function addNewUser(event) {
  event.preventDefault()

  const userName = document.getElementById("userNameId").value
  const userEmail = document.getElementById("userEmailId").value
  const userPassword = document.getElementById("userPasswordId").value
  const userRoleElement = document.getElementById("userRoleId")
  const userRole = userRoleElement ? userRoleElement.value : "user"

  if (!userName || !userEmail || !userPassword) {
    alert("Por favor, rellena todos los campos.")
    return
  }

  const query = `
    mutation CreateUser($name: String!, $email: String!, $password: String!, $role: String!) {
      createUser(input: { name: $name, email: $email, password: $password, role: $role })
    }
  `

  const variables = {
    name: userName,
    email: userEmail,
    password: userPassword,
    role: userRole
  }

  const token = localStorage.getItem("token")

  try {
    await graphqlRequest(query, variables, token)

    alert("Usuario creado correctamente")

    showUsersTable()

    document.getElementById("userNameId").value = ""
    document.getElementById("userEmailId").value = ""
    document.getElementById("userPasswordId").value = ""
    if (userRoleElement) userRoleElement.value = "user"

  } catch (error) {
    alert("Error al crear el usuario: " + error.message)
  }
}


// Mostrar voluntariados en tabla
export async function addCardsInTable() {
  const table = document.getElementById("volTableId")
  const token = localStorage.getItem("token")

  // Limpiar la tabla y añadir cabecera
  table.innerHTML = `
    <tr>
      <th>Email</th>
      <th>Fecha</th>
      <th>Título</th>
      <th>Descripción</th>
      <th>Tipo voluntariado</th>
      <th>Acciones</th>
    </tr>
  `

  const currentUser = await getCurrentUser(token)

  if (!currentUser) {
    console.error("No se pudo obtener el usuario actual.")
    return
  }

  const role = currentUser.role

  let query
  if (role === "admin") {
    query = `
    query {
      getCards {
        _id
        email
        date
        title
        description
        volunType
      }
    }
  `
  } else {
    query = `
    query {
      getCardsByCurrentUser {
        _id
        email
        date
        title
        description
        volunType
      }
    }
  `
  }

  try {
    const data = await graphqlRequest(query, {}, token)
    const cards = role === "admin" ? data.getCards : data.getCardsByCurrentUser

    for (let card of cards) {
      addCardRow(card)
    }
  } catch (error) {
    console.error("No se pudieron cargar los voluntariados:", error)
  }
}

function addCardRow(card) {
  const tbody = document.querySelector("#volTableId tbody")
  const row = document.createElement("tr")

  const classColor = card.volunType === "Oferta" ? "table-primary" : "table-success"
  row.classList.add(classColor)

  row.innerHTML = `
    <td class="fw-normal">${card.email}</td>
    <td class="fw-normal">${card.date}</td>
    <td class="fw-normal">${card.title}</td>
    <td class="fw-normal">${card.description}</td>
    <td class="fw-normal">${card.volunType}</td>
    <td>
      <button type="button" class="btn btn-danger delete-vol" data-id="${card._id}" data-title="${card.title}">Eliminar</button>
    </td>
  `

  tbody.appendChild(row)
}

document.addEventListener("click", function (event) {
  if (event.target.classList.contains("delete-vol")) {
    const title = event.target.getAttribute("data-title")
    const idCard = event.target.getAttribute("data-id")
    const confirmDelete = confirm(`¿Estás seguro que deseas eliminar el voluntariado "${title}"?`)

    if (confirmDelete) {
      deleteCard(idCard)
    }
  }
})

//Elimina un voluntariado de la base de datos
async function deleteCard(idCard) {
  const token = localStorage.getItem("token")

  const query = `
    mutation DeleteCard($cardId: ID!) {
      deleteCard(cardId: $cardId)
    }
  `
  const variables = { cardId: idCard }

  try {
    const data = await graphqlRequest(query, variables, token)

    if (data) {
      const message = data.deleteCard
      alert(message)
      addCardsInTable()
    } else {
      alert("No se pudo eliminar el voluntariado")
    }
  } catch (error) {
    alert("Error al eliminar el voluntariado: " + error.message)
  }
}

//Añade un voluntariado a la base de datos
export async function addCard() {
  const email = document.getElementById("newVolEmailId").value.trim()
  const date = document.getElementById("volDateId").value.trim()
  const title = document.getElementById("newVolTitleId").value.trim()
  const description = document.getElementById("newVolDescriptionId").value.trim()
  const volunType = document.getElementById("volSelectId").value.trim()
  const token = localStorage.getItem("token")

  if (!email || !date || !title || !description || !volunType) {
    alert("Por favor, completa todos los campos.")
    return
  }

  const currentUser = await getCurrentUser(token)
  if (!currentUser) {
    alert("No se pudo obtener el usuario actual.")
    return
  }
  const autor = currentUser.name

  const query = `
    mutation CreateCard($email: String!, $autor: String!, $date: String!, $title: String!, $description: String!, $volunType: String!){
      createCard(input: {
        email: $email,
        autor: $autor,
        date: $date,
        title: $title,
        description: $description,
        volunType: $volunType
      }) {
        _id
        email
        autor
        date
        title
        description
        volunType  
      }
    }
  `
  const variables = { email, autor, date, title, description, volunType }

  try {
    const data = await graphqlRequest(query, variables, token)
    if (data) {
      alert("Voluntariado registrado correctamente")

      document.getElementById("newVolEmailId").value = ""
      document.getElementById("volDateId").value = ""
      document.getElementById("newVolTitleId").value = ""
      document.getElementById("newVolDescriptionId").value = ""
      document.getElementById("volSelectId").value = ""

      addCardsInTable()
    } else {
      alert("No se pudo registrar el voluntariado")
    }
  } catch (error) {
    alert("Error al registrar el voluntariado: " + error.message)
  }
}

//API Canvas
export async function getChartData() {
  const token = localStorage.getItem("token")
  const query = `
    query {
      getCards {
        email
        volunType
      }
    }
  `

  try {
    const data = await graphqlRequest(query, {}, token)
    if (!data || !data.getCards) {
      console.error("No se recibieron datos para el gráfico")
      return
    }

    const cards = data.getCards
    let userStats = {}

    cards.forEach(vol => {
      if (!userStats[vol.email]) {
        userStats[vol.email] = { oferta: 0, peticion: 0 }
      }
      if (vol.volunType === "Oferta") {
        userStats[vol.email].oferta++
      } else {
        userStats[vol.email].peticion++
      }
    })

    drawChart(userStats)
  } catch (error) {
    console.error("Error al obtener datos para el gráfico:", error)
  }
}

// se dibuja el gráfico con los datos obtenidos
function drawChart(userStats) {
  let canvas = document.getElementById("canvas")
  let ctx = canvas.getContext("2d")
  canvas.width = 1200
  canvas.height = 400

  let users = Object.keys(userStats)
  let barWidth = 40
  let gap = 50
  let startX = 100
  let maxHeight = 300

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.font = "14px Arial"

  // Dibujar eje Y
  ctx.beginPath()
  ctx.moveTo(80, 20)
  ctx.lineTo(80, canvas.height - 50)
  ctx.stroke()

  // Marcas y números del eje Y
  for (let i = 0; i <= 4; i++) {  // Se reduce el eje Y hasta 4
    let y = canvas.height - 50 - (i * (maxHeight / 4))
    ctx.fillText(i, 60, y)
    ctx.beginPath()
    ctx.moveTo(75, y)
    ctx.lineTo(85, y)
    ctx.stroke()
  }

  users.forEach((user, index) => {
    let x = startX + index * (barWidth * 2 + gap)
    let ofertaHeight = (userStats[user].oferta / 4) * maxHeight
    let peticionHeight = (userStats[user].peticion / 4) * maxHeight

    ctx.fillStyle = "#0d6efd"
    ctx.fillRect(x, canvas.height - ofertaHeight - 50, barWidth, ofertaHeight)
    ctx.fillStyle = "#198754"
    ctx.fillRect(x + barWidth, canvas.height - peticionHeight - 50, barWidth, peticionHeight)

    ctx.fillStyle = "black"
    ctx.save()
    ctx.translate(x + barWidth / 2, canvas.height - 5)
    ctx.rotate(-Math.PI / 4)
    ctx.fillText(user, 0, 0)
    ctx.restore()
  })
}

/*
* API DRAG&DROP
*/
export async function getCardsFromDB() {
  try {
    const token = localStorage.getItem("token") || ""
    const [allCardsData, selectedData] = await Promise.all([
      graphqlRequest(
        `
          query {
            getCards {
              _id
              title
              description
              date
              email
              volunType
            }
          }
        `,
        {},
        token
      ),
      graphqlRequest(
        `
          query {
            getUserCards {
              _id
              title
              description
              date
              email
              volunType
            }
          }
        `,
        {},
        token
      )
    ])

    const selectedTitles = new Set(
      selectedData.getUserCards
        .filter(c => c && c.title) // <--- Esto filtra nulos o sin título
        .map(c =>
          c.title.trim().toLowerCase().replace(/\s+/g, '_')
        )
    )

    allCardsData.getCards.forEach(card => {
      const titleSafe = card.title.trim().toLowerCase().replace(/\s+/g, '_')
      if (!selectedTitles.has(titleSafe)) {
        showCardInDragContainer(card)
      }
    })
  } catch (error) {
    console.error('Error al obtener tarjetas:', error)
  }
}

export async function loadSelectedCards() {
  try {
    const token = localStorage.getItem("token") || ""
    const data = await graphqlRequest(
      `
        query {
          getUserCards {
            _id
            title
            description
            date
            email
            volunType
          }
        }
      `,
      {},
      token
    )

    data.getUserCards.forEach(addCardToDropContainer)
  } catch (error) {
    console.error("Error al cargar tarjetas seleccionadas:", error)
  }
}

export async function saveSelectedCard({ _id }) {
  try {
    const token = localStorage.getItem("token") || ""
    await graphqlRequest(
      `
        mutation ($cardId: String!) {
          addUserCard(cardId: $cardId)
        }
      `,
      { cardId: _id },
      token
    )
  } catch (error) {
    console.error("Error al guardar selección:", error)
  }
}

export async function removeSelectedCard(cardTitleSafe) {
  try {
    const token = localStorage.getItem("token") || ""
    const data = await graphqlRequest(
      `
        query {
          getUserCards {
            _id
            title
          }
        }
      `,
      {},
      token
    )

    const card = data.getUserCards.find(
      c => c.title.trim().toLowerCase().replace(/\s+/g, '_') === cardTitleSafe
    )

    if (!card) return

    await graphqlRequest(
      `
        mutation ($cardId: String!) {
          deleteUserCard(cardId: $cardId)
        }
      `,
      { cardId: card._id },
      token
    )
  } catch (error) {
    console.error("Error al eliminar selección:", error)
  }
}

export function showCardInDragContainer(cardData) {
  const titleSafe = cardData.title.trim().toLowerCase().replace(/\s+/g, '_')

  const cardElement = document.createElement("div")
  cardElement.classList.add("m-3", "dragBox", "col-6", "col-md-6")
  cardElement.setAttribute("draggable", "true")
  cardElement.setAttribute("data-title", titleSafe)
  cardElement.setAttribute("data-id", cardData._id)

  cardElement.innerHTML = `
    <div class="card ${cardData.volunType === "Oferta" ? "text-bg-primary" : "text-bg-success"}" style="max-width: 18rem;">
      <div class="card-body">
        <h5 class="card-title fw-bold textPoppinsFont">${cardData.title}</h5>
        <p class="card-text textRockSFont">${cardData.description}</p>
        <p class="card-text fst-italic textPatrickFont">Fecha publicación ${cardData.date}</p>
        <p class="card-text text-decoration-underline textPatrickFont">Publicado por ${cardData.email}</p>
      </div>
    </div>
  `

  cardElement.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", titleSafe)
  })

  dragContainer.appendChild(cardElement)
}

export function addCardToDropContainer(cardData) {
  const titleSafe = cardData.title.trim().toLowerCase().replace(/\s+/g, '_')

  const cardElement = document.createElement("div")
  cardElement.classList.add("m-3", "dragBox", "col-6", "col-md-6")
  cardElement.setAttribute("draggable", "true")
  cardElement.setAttribute("data-title", titleSafe)
  cardElement.setAttribute("data-id", cardData._id)

  cardElement.innerHTML = `
    <div class="card ${cardData.volunType === "Oferta" ? "text-bg-primary" : "text-bg-success"}" style="max-width: 18rem;">
      <div class="card-body">
        <h5 class="card-title fw-bold textPoppinsFont">${cardData.title}</h5>
        <p class="card-text textRockSFont">${cardData.description}</p>
        <p class="card-text fst-italic textPatrickFont">Fecha publicación ${cardData.date}</p>
        <p class="card-text text-decoration-underline textPatrickFont">Publicado por ${cardData.email}</p>
      </div>
    </div>
  `

  cardElement.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", titleSafe)
  })

  dropContainer.appendChild(cardElement)
}

export function moveCard(cardTitleSafe, sourceContainer, targetContainer) {
  const existsInTarget = targetContainer.querySelector(`[data-title="${cardTitleSafe}"]`)
  if (existsInTarget) return

  const draggedElement = sourceContainer.querySelector(`[data-title="${cardTitleSafe}"]`)
  if (!draggedElement) return

  const cardClone = draggedElement.cloneNode(true)

  cardClone.addEventListener("dragstart", (e) => {
    e.dataTransfer.setData("text/plain", cardTitleSafe)
  })

  targetContainer.appendChild(cardClone)
  sourceContainer.removeChild(draggedElement)

  const cardId = draggedElement.getAttribute("data-id")

  if (sourceContainer === dropContainer && targetContainer === dragContainer) {
    removeSelectedCard(cardTitleSafe)
  } else if (sourceContainer === dragContainer && targetContainer === dropContainer) {
    saveSelectedCard({ _id: cardId })
  }
}