let mediaRecorder;
let audioChunks = [];

// Cambia a wss:// si estás usando HTTPS
const SERVER_IP = "192.168.0.231"; // Reemplaza con la IP local de tu servidor
const socket = new WebSocket(`wss://${SERVER_IP}:8080`);

socket.onopen = () => {
    console.log("Conexión WebSocket establecida.");
};

socket.onerror = (error) => {
    console.error("Error en WebSocket:", error);
};

// Cuando se da click al botón de iniciar grabación
document.getElementById("start").addEventListener("click", async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                socket.send(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            socket.send("END");
        };

        mediaRecorder.start(1000); // Envía cada 1 segundo
        document.getElementById("start").disabled = true;
        document.getElementById("stop").disabled = false;
    } catch (error) {
        console.error("Error al acceder al micrófono:", error);
    }
});

// Cuando se da click al botón de detener grabación
document.getElementById("stop").addEventListener("click", () => {
    mediaRecorder.stop();
    document.getElementById("start").disabled = false;
    document.getElementById("stop").disabled = true;
});

// Manejo de la respuesta de la transcripción desde el servidor WebSocket
socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    const planeText = document.querySelector('#transcriptionText');
    if (planeText && data.text) {
        planeText.setAttribute('value', data.text);
    } else {
        console.warn('No se encontró a-text dentro de transcription-display para mostrar la transcripción');
    }
};