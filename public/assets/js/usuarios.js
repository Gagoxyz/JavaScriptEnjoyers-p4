/**
* lógica del fichero usuarios.html 
*/

// importamos las funciones "showActiveUser", "showUsersTable" y "addNewUser" del fichero "almacenaje.js"
//import { showActiveUser, showUsersTable, addNewUser } from "./almacenaje.js"
import { showUsersTable, showActiveUser, addNewUser, getCurrentUser } from "./almacenaje2.js"

// constante para identificar el botón de "submitId"
const domSubmit = document.getElementById("submitId")

// EventListenner para llamar a la función "addNewUser" en el click del botón
domSubmit.addEventListener("click", addNewUser)

// llamamos a las funciones "showActiveUsers" y "showUsersTable" al cargar el DOM
window.addEventListener("DOMContentLoaded", () => {
    showActiveUser()
    showUsersTable()
    setupRoleInputIfAdmin()
})

// Nuevo inputo cuando el usuario es "admin"
async function setupRoleInputIfAdmin() {
    const token = localStorage.getItem("token")
    const currentUser = await getCurrentUser(token)

    if (currentUser && currentUser.role === "admin") {
        const roleInputDiv = document.createElement("div")
        roleInputDiv.classList.add("col-md-6")
        roleInputDiv.innerHTML = `
            <label for="userRoleId" class="form-label">Rol</label>
            <select class="form-select" id="userRoleId">
              <option value="user" selected>Usuario</option>
              <option value="admin">Administrador</option>
            </select>
        `
        const form = document.querySelector("form")
        const submitBtn = document.getElementById("submitId")
        form.insertBefore(roleInputDiv, submitBtn.parentElement)
    }
}
