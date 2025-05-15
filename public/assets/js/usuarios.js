/**
* lógica del fichero usuarios.html 
*/

// importamos las funciones "showActiveUser", "showUsersTable" y "addNewUser" del fichero "almacenaje.js"
//import { showActiveUser, showUsersTable, addNewUser } from "./almacenaje.js"
import { showUsersTable, showActiveUser, addNewUser } from "./almacenaje2.js"

// constante para identificar el botón de "submitId"
const domSubmit = document.getElementById("submitId")

// EventListenner para llamar a la función "addNewUser" en el click del botón
domSubmit.addEventListener("click", addNewUser)

// llamamos a las funciones "showActiveUsers" y "showUsersTable" al cargar el DOM
window.addEventListener("DOMContentLoaded", () => {
    showActiveUser()
    showUsersTable()
})
