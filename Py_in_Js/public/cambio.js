// Conexión con el servidor WebSocket
const socket = io();

// Selecciona los elementos de la página
const button = document.getElementById("toggle-button");
const text = document.getElementById("center-text");

// Manejo del botón
let listening = false;

button.addEventListener("click", () => {
    // Cambiar el estado de escucha
    listening = !listening;

    // Cambiar el texto del botón y el mensaje en pantalla
    if (listening) {
        button.textContent = "Detener escucha";
        text.textContent = "Escuchando...";
    } else {
        button.textContent = "Iniciar escucha";
        text.textContent = "Esperando...";
    }

    // Enviar al servidor para activar o desactivar la escucha
    socket.emit("toggle-listening", listening);
});

// Escuchar las transcripciones del servidor
socket.on("transcription", (transcription) => {
    console.log("Received transcription:", transcription);

    // Si la transcripción contiene "verde" o "rojo", cambia el color
    if (transcription.includes("verde")) {
        document.body.style.backgroundColor = "green";
        text.textContent = "VERDE";
    } else if (transcription.includes("rojo")) {
        document.body.style.backgroundColor = "red";
        text.textContent = "ROJO";
    } else {
        text.textContent = `Sin reconocimiento: ${transcription}`;
    }
});
