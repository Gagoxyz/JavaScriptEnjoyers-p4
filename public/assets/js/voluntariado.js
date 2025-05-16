/**
* lógica del fichero voluntariado.html
*/

import { showActiveUser, addCardsInTable, addCard, getChartData, addCardRow } from "./almacenaje2.js"

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

const socket = io()

socket.on("nuevo-voluntariado", (card) => {
    console.log("Se ha añadido un nuevo voluntariado por WebSockets:", card)
    addCardRow(card)
})