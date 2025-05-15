/**
* lógica del fichero voluntariado.html
*/

import { showActiveUser, startDataBase, addCardsInTable, addCardDB, getChartData } from "./almacenaje.js"

// declaramos constantes para obtener el ID de diferentes elementos del DOM
const submitButton = document.getElementById("submitId")
//const volTable = document.getElementById("volTableId")


// listener para añadir un nuevo registro a la BBDD
submitButton.addEventListener("click", addCardDB)

// listeners para mostrar el usuario activo del WebStorage e iniciar la BBDD 
window.addEventListener("DOMContentLoaded", () => {
    showActiveUser()
    startDataBase()
    addCardsInTable()
    getChartData()
})
