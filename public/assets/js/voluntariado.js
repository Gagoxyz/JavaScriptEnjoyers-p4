/**
* lógica del fichero voluntariado.html
*/

import { showActiveUser, addCardsInTable, addCard, getChartData } from "./almacenaje2.js"

// declaramos constantes para obtener el ID de diferentes elementos del DOM
const submitButton = document.getElementById("submitId")
//const volTable = document.getElementById("volTableId")


// listener para añadir un nuevo registro a la BBDD
submitButton.addEventListener("click", addCard)

// listeners para mostrar el usuario activo del WebStorage e iniciar la BBDD 
window.addEventListener("DOMContentLoaded", () => {
    showActiveUser()
    addCardsInTable()
    getChartData()
})
