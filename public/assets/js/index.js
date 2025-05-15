/**
* lógica del fichero index.html
*/

// importamos las funciones necesarias desde "almacenaje.js"
import { showActiveUser, loadUsersToStorage, startDataBase, getCardsFromDB, moveCard, loadSelectedCards } from './almacenaje.js'

// declaramos constantes para identificar los 2 contenedores
const dragContainer = document.getElementById("dragContainer")
const dropContainer = document.getElementById("dropContainer")

// listener para que las tarjetas del "dropContainer" (Selección) sean draggable (se puedan arrastrar)
dropContainer.addEventListener("dragover", (e) => {
    e.preventDefault()
    dropContainer.style.backgroundColor = "rgba(0, 0, 0, 0.1)" // se añade un efecto visual al realizar la acción de arrastrar
})

dropContainer.addEventListener("dragleave", () => {
    dropContainer.style.backgroundColor = "" // elimina el efecto visual
})

dropContainer.addEventListener("drop", (e) => {
    e.preventDefault()
    dropContainer.style.backgroundColor = "" // elimina el efecto visual

    let cardTitleSafe = e.dataTransfer.getData("text/plain")

    // mover la tarjeta de dragContainer a dropContainer
    if (e.target === dropContainer || e.target === dropContainer.closest('.container')) { // verificamos que el "drop" ocurra sobre dropContainer
        moveCard(cardTitleSafe, dragContainer, dropContainer)
    }
})

// listener para que las tarjetas del "dragContainer" (Disponibles) sean draggable (se puedan arrastrar)
dragContainer.addEventListener("dragover", (e) => {
    e.preventDefault()
    dragContainer.style.backgroundColor = "rgba(0, 0, 0, 0.1)" // se añade un efecto visual al realizar la acción de arrastrar
})

dragContainer.addEventListener("dragleave", () => {
    dragContainer.style.backgroundColor = "" // elimina el efecto visual
})

dragContainer.addEventListener("drop", (e) => {
    e.preventDefault()
    dragContainer.style.backgroundColor = ""; // elimina el efecto visual

    let cardTitleSafe = e.dataTransfer.getData("text/plain")

    if (e.target === dragContainer || e.target === dragContainer.closest('.container')) {
        moveCard(cardTitleSafe, dropContainer, dragContainer)
    }
})

// listener para ejecutar funciones cuando el DOM haya cargado completamente
window.addEventListener("DOMContentLoaded", () => {
    loadUsersToStorage()
    showActiveUser()
    startDataBase()
    getCardsFromDB()
    loadSelectedCards()
})
