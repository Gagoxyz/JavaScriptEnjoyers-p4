/**
* lógica del fichero login.html
*/

// importamos la función "loginUser" del fichero almacenaje.js
import { loginUser, showActiveUser } from "./almacenaje2.js";

// declaramos constantes para obtener el ID de diferentes elementos del DOM
const domSubmitValues = document.getElementById('submitValues')
const domUserLogged = document.getElementById('activeUser')
const domUserIsLogged = document.getElementById('userIsLogged')
const domUserForm = document.getElementById('userForm')

domSubmitValues.addEventListener("click", loginUser)

// asignamos a una variable "user" el item del WebStorage, con un condicional verificamos si tiene algún contenido (true), de ser así asignamos al "domUserLogged" el user (es el email)
function userLogged() {
    let user = localStorage.getItem("activeUser")

    if (user) {
        domUserLogged.textContent = user
        domUserIsLogged.textContent = `¡Bienvenid@ ${user}!`
        domUserForm.innerHTML = `
        <div>
            <h4>Usuario ${user} autenticado correctamente</h4><br>
            <button class="btn btn-primary" id="buttonDisconnect">Desconectar</button>
        </div>`

        let buttonDisconnect = document.getElementById("buttonDisconnect")

        buttonDisconnect.addEventListener("click", function () {
            localStorage.removeItem("activeUser")
            localStorage.removeItem("token")
            location.reload()
        })
    }
}

// listener para que en la siguiente actualización del DOM verifique si el usuario ha loggeado
document.addEventListener("DOMContentLoaded", () => {
    showActiveUser()
    userLogged()
})


