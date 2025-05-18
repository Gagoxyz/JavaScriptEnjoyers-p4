import { loginUser, showActiveUser, getCurrentUser } from "./almacenaje2.js"

const domSubmitValues = document.getElementById("submitValues")
const domUserLogged = document.getElementById("activeUser")
const domUserIsLogged = document.getElementById("userIsLogged")
const domUserForm = document.getElementById("userForm")
const domUserCard = document.getElementById("userCard")

domSubmitValues.addEventListener("click", loginUser)

async function userLogged() {
  const token = localStorage.getItem("token")
  if (!token) {
    domUserForm.style.display = "block"
    return
  }

  try {
    const currentUser = await getCurrentUser(token)
    if (!currentUser) {
      domUserForm.style.display = "block"
      return
    }

    const { name, email, password, role } = currentUser
    const userNavbar = localStorage.getItem("activeUser")

    domUserLogged.textContent = userNavbar
    domUserIsLogged.textContent = `¡Bienvenid@ ${name}!`

    domUserCard.innerHTML = `
      <div class="card shadow p-4 mt-4 mx-auto" style="max-width: 500px;">
        <div class="card-body">
          <h5 class="card-title text-center mb-3">Perfil del Usuario</h5>
          <ul class="list-group list-group-flush">
            <li class="list-group-item"><strong>Nombre:</strong> ${name}</li>
            <li class="list-group-item"><strong>Email:</strong> ${email}</li>
            <li class="list-group-item"><strong>Contraseña (hash):</strong> <code>${password.slice(0, 20)}...</code></li>
            <li class="list-group-item"><strong>Rol:</strong> ${role}</li>
          </ul>
          <div class="d-grid mt-4">
            <button class="btn btn-danger" id="buttonDisconnect">Desconectar</button>
          </div>
        </div>
      </div>
    `

    domUserCard.style.display = "block"

    document.getElementById("buttonDisconnect").addEventListener("click", () => {
      localStorage.removeItem("activeUser")
      localStorage.removeItem("token")
      location.reload()
    })

  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error)
    domUserForm.style.display = "block"
  }
}

document.addEventListener("DOMContentLoaded", () => {
  showActiveUser()
  userLogged()
})
