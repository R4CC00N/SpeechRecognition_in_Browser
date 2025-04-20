// Función para actualizar el mensaje del usuario
function updateUserMessage(message) {
    const messageElement = document.querySelector('#userMessage');
    if (messageElement) {
        messageElement.setAttribute('value', message);
    }
}

AFRAME.registerComponent('input-text', {
    schema: {
      message: { type: 'string', default: 'Comienza la grabación!' },
      event: { type: 'string', default: '' },
    },
    init: function () {
      let mediaRecorder;
      let audioChunks = [];
      const API_KEY = "baae6adc416c4635ad8e8f1e72f81c5b";  // Asegúrate de que la clave esté entre comillas
  
      // Guardar referencia a this.el para usarla en las funciones asínc ronas
      const el = this.el;
  
      // Verificar que los botones existan
      const startRecordingButton = document.getElementById("voiceInputBox");
      const stopRecordingButton = document.getElementById("stopRecording");
  
      if (startRecordingButton && stopRecordingButton) {
        startRecordingButton.addEventListener("click", startRecording);
        stopRecordingButton.addEventListener("click", stopRecording);
      } else {
        console.error("No se encontraron los botones de grabación en el DOM.");
      }
  
      async function startRecording() {
        // Solicitar acceso al micrófono
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
  
        mediaRecorder.ondataavailable = event => {
          audioChunks.push(event.data);
        };
  
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
          const audioUrl = URL.createObjectURL(audioBlob);
          console.log("Audio grabado:", audioUrl);
  
          // Enviar el archivo a AssemblyAI
          uploadToAssemblyAI(audioBlob);
        };
  
        mediaRecorder.start();
        startRecordingButton.disabled = true;
        stopRecordingButton.disabled = false;
      }
  
      function stopRecording() {
        mediaRecorder.stop();
        startRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;
      }
  
      async function uploadToAssemblyAI(audioBlob) {
        // Obtener la URL de la API para cargar el archivo
        const formData = new FormData();
        formData.append("file", audioBlob, "audio.wav");
  
        const response = await fetch("https://api.assemblyai.com/v2/upload", {
          method: "POST",
          headers: {
            "authorization": API_KEY  // Usar la variable API_KEY aquí
          },
          body: formData
        });
  
        if (response.ok) {
          const result = await response.json();
          const audioUrl = result.upload_url;
          console.log("Archivo subido a AssemblyAI. URL:", audioUrl);
  
          // Iniciar la transcripción
          startTranscription(audioUrl);
        } else {
          console.error("Error al subir el archivo:", response.statusText);
        }
      }
  
      async function startTranscription(audioUrl) {
        const response = await fetch("https://api.assemblyai.com/v2/transcript", {
          method: "POST",
          headers: {
            "authorization": API_KEY,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            audio_url: audioUrl
          })
        });
  
        if (response.ok) {
          const result = await response.json();
          const transcriptionId = result.id;
          console.log("Transcripción iniciada. ID:", transcriptionId);
  
          // Verificar el estado de la transcripción
          checkTranscriptionStatus(transcriptionId);
        } else {
          console.error("Error al iniciar la transcripción:", response.statusText);
        }
      }
  
      async function checkTranscriptionStatus(transcriptionId) {
        const response = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptionId}`, {
          method: "GET",
          headers: {
            "authorization": API_KEY
          }
        });
  
        if (response.ok) {
          const result = await response.json();
          if (result.status === "completed") {
            console.log("Transcripción completada:", result.text);
            el.emit('transcription', { transcription: result.text });  // Emitir evento A-Frame con el texto
          } else {
            console.log("La transcripción aún está en progreso...");
            setTimeout(() => checkTranscriptionStatus(transcriptionId), 5000); // Volver a consultar cada 5 segundos
          }
        } else {
          console.error("Error al obtener el estado de la transcripción:", response.statusText);
        }
      }
    }
  });
    

    // Componente de visualización de transcripción
    AFRAME.registerComponent('transcription-display', {
        schema: {
            input: { type: 'selector', default: null }, // Selector del elemento que genera transcripciones
        },

        init: function () {
            const el = this.el;
            const inputElement = this.data.input;

            if (!inputElement) {
                console.error('No se ha especificado un elemento de entrada para transcription-display');
                return;
            }

            // Escuchar eventos de transcripción desde el elemento especificado
            inputElement.addEventListener('transcription', (event) => {
                const transcript = event.detail.transcription;
                const planeText = el.querySelector('#transcriptionText');

                if (planeText) {
                    planeText.setAttribute('value', transcript);
                } else {
                    console.warn('No se encontró a-text dentro de transcription-display para mostrar la transcripción');
                }
            });
        }
    });

