require("dotenv").config();
const fs = require("fs");
const express = require("express");
const WebSocket = require("ws");
const https = require("https");
const axios = require("axios");

const app = express();
const wss = new WebSocket.Server({ noServer: true });

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY;

// Lee los archivos de certificado SSL
const privateKey = fs.readFileSync("ssl/server.key", "utf8");
const certificate = fs.readFileSync("ssl/server.crt", "utf8");
const credentials = { key: privateKey, cert: certificate };

app.use(express.static("public"));

wss.on("connection", (ws) => {
    console.log("Cliente conectado");

    let audioBuffers = [];

    ws.on("message", async (chunk) => {
        if (chunk.toString() === "END") {
            const audioBuffer = Buffer.concat(audioBuffers);
            const filePath = `uploads/audio_${Date.now()}.webm`;

            fs.writeFileSync(filePath, audioBuffer);
            console.log("📥 Archivo recibido, enviando a AssemblyAI...");

            try {
                // Subir archivo a AssemblyAI
                const response = await axios.post(
                    "https://api.assemblyai.com/v2/upload",
                    fs.createReadStream(filePath),
                    { headers: { Authorization: ASSEMBLYAI_API_KEY, "Transfer-Encoding": "chunked" } }
                );

                const audioUrl = response.data.upload_url;
                console.log("✅ Archivo subido:", audioUrl);

                // Iniciar transcripción
                const transcriptResponse = await axios.post(
                    "https://api.assemblyai.com/v2/transcript",
                    { audio_url: audioUrl, language_code: "es" },
                    { headers: { Authorization: ASSEMBLYAI_API_KEY, "Content-Type": "application/json" } }
                );

                const transcriptId = transcriptResponse.data.id;
                console.log("🔄 Iniciando transcripción, ID:", transcriptId);

                // Verificar el estado de la transcripción
                checkTranscription(ws, transcriptId, filePath);
            } catch (error) {
                console.error("❌ Error en la transcripción:", error);
                ws.send(JSON.stringify({ error: "Error al transcribir" }));
            }

            audioBuffers = [];
        } else {
            audioBuffers.push(chunk);
        }
    });

    ws.on("close", () => console.log("❌ Cliente desconectado"));
});

// Función para verificar el estado de la transcripción
const checkTranscription = (ws, transcriptId, filePath) => {
    const interval = setInterval(async () => {
        try {
            const result = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
                { headers: { Authorization: ASSEMBLYAI_API_KEY } }
            );

            if (result.data.status === "completed") {
                ws.send(JSON.stringify({ text: result.data.text }));
                console.log("✅ Transcripción completa:", result.data.text);
                fs.unlinkSync(filePath); // Borrar el archivo temporal
                clearInterval(interval);
            } else if (result.data.status === "failed") {
                ws.send(JSON.stringify({ error: "❌ Error en la transcripción" }));
                clearInterval(interval);
            }
        } catch (error) {
            console.error("❌ Error al verificar transcripción:", error);
        }
    }, 2000); // Verifica cada 2 segundos
};

// Configurar el servidor HTTPS
const port = 8080;
// Configurar el servidor para que sea accesible desde cualquier dispositivo en la red local
const host = "0.0.0.0";  // Esto hace que sea accesible desde cualquier dispositivo en la red

const server = https.createServer(credentials, app);

// Configuración WebSocket para aceptar conexiones externas
server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
    });
});

// Iniciar el servidor
server.listen(port, host, () => {
    console.log(`🚀 Servidor corriendo en https://${host}:${port}`);
});
