const { spawn } = require("child_process");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let listening = false;  // Estado de escucha (activo o no)

app.use(express.static("public")); // Servir archivos estáticos en la carpeta 'public'

// Cuando un cliente se conecta
io.on("connection", (socket) => {
    console.log("A user connected");

    // Cuando el cliente presiona el botón
    socket.on("toggle-listening", (startListening) => {
        listening = startListening;
        console.log("Listening: ", listening);

        // Si comienza la escucha, ejecutamos el script Python
        if (listening) {
            startListeningProcess(socket);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Función para iniciar la escucha (llama al script Python)
function startListeningProcess(socket) {
    const pythonProcess = spawn("python", ["transcribe.py"]);

    pythonProcess.stdout.on("data", (data) => {
        const transcription = data.toString().trim().toLowerCase();
        console.log("Transcription:", transcription);
        socket.emit("transcription", transcription);  // Enviar transcripción al cliente
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Error: ${data.toString().trim()}`);
    });
}

// Iniciar el servidor en el puerto 3000
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
