// Conexión con el servidor WebSocket
const socket = io();

// Selección de elementos del DOM
const button = document.getElementById("toggle-button");
const text = document.getElementById("center-text");

// Estado inicial
let listening = false;

// Manejo del botón para activar/desactivar escucha
button.addEventListener("click", () => {
    listening = !listening; // Alternar estado

    // Cambiar texto del botón y del estado
    button.textContent = listening ? "Detener escucha" : "Iniciar escucha";
    text.textContent = listening ? "Escuchando..." : "Esperando...";

    // Emitir estado al servidor
    socket.emit("toggle-listening", listening);
});

// Recibir transcripciones del servidor
socket.on("transcription", (transcription) => {
    console.log("Received transcription:", transcription);

    // Siempre muestra la transcripción en pantalla
    addTranscription(transcription);

    // Detectar palabras clave para cambiar el color de fondo
    if (transcription.includes("verde")) {
        updateBackground("green");
    } else if (transcription.includes("rojo")) {
        updateBackground("red");
    } else if (transcription.includes("azul")) {
        updateBackground("blue");
    } else if (transcription.includes("amarillo")) {
        updateBackground("yellow");
    }
});

// Función para actualizar el fondo según palabras clave
function updateBackground(color) {
    document.body.style.transition = "background-color 0.5s"; // Transición suave
    document.body.style.backgroundColor = color;
}

// Función para agregar transcripciones a la pantalla
function addTranscription(message) {
    const p = document.createElement("p");
    p.textContent = message;
    p.style.margin = "5px 0";
    text.appendChild(p);

    // Asegurarse de que el último mensaje sea visible
    text.scrollTop = text.scrollHeight;
}

// Manejo de errores desde el servidor
socket.on("error", (error) => {
    console.error("Error recibido:", error);
    const p = document.createElement("p");
    p.textContent = `Error: ${error}`;
    p.style.color = "red";
    text.appendChild(p);
});
