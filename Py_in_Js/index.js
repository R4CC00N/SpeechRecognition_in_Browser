const { spawn } = require("child_process");
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let listening = false; // Estado de escucha

app.use(express.static("public")); // Sirve archivos estáticos desde la carpeta 'public'

// Manejo de conexiones
io.on("connection", (socket) => {
    console.log("Cliente conectado");

    let pythonProcess = null;

    // Manejar el evento de "toggle-listening"
    socket.on("toggle-listening", (startListening) => {
        listening = startListening;
        console.log("Listening:", listening);

        if (listening) {
            pythonProcess = startListeningProcess(socket);
        } else if (pythonProcess) {
            pythonProcess.kill(); // Detener el proceso Python si se deja de escuchar
            console.log("Proceso Python detenido");
        }
    });

    socket.on("disconnect", () => {
        console.log("Cliente desconectado");
        if (pythonProcess) {
            pythonProcess.kill(); // Asegurarse de terminar el proceso Python al desconectar
        }
    });
});

// Función para iniciar el proceso de escucha
function startListeningProcess(socket) {
    const pythonProcess = spawn("python", ["transcribe.py"]);

    pythonProcess.stdout.on("data", (data) => {
        const transcription = data.toString().trim();
        console.log("Transcription:", transcription);
        socket.emit("transcription", transcription); // Enviar transcripción al cliente
    });

    pythonProcess.stderr.on("data", (data) => {
        console.error(`Error: ${data.toString().trim()}`);
    });

    pythonProcess.on("close", (code) => {
        console.log(`Proceso Python finalizado con código ${code}`);
    });

    return pythonProcess;
}

// Iniciar servidor
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
