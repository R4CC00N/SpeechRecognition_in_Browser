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
        const el = this.el;
        let isRecording = false;
        let recognition;
        const API_KEY = 'baae6adc416c4635ad8e8f1e72f81c5b'; // Reemplaza con tu API Key

        // ✅ Verificar si el navegador soporta la API de reconocimiento de voz
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.continuous = true;  // ✅ Para que siga escuchando sin detenerse
            recognition.interimResults = true; // ✅ Para mostrar texto en tiempo real
            recognition.lang = 'es-ES';  // ✅ Ajustar a idioma español
        } else {
            console.error('El navegador no soporta la API de reconocimiento de voz.');
            return;
        }

        // ✅ Mostrar texto en tiempo real mientras hablas
        recognition.onresult = (event) => {
            let transcript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            console.log('msg:', transcript);
            el.emit('transcription', { transcription: transcript }); // Emitir evento A-Frame
        };

        recognition.onerror = (event) => {
            console.error('Error en el reconocimiento de voz:', event.error);
        };

        // ✅ Iniciar/detener reconocimiento de voz al hacer clic en el objeto A-Frame
        el.addEventListener('click', () => {
            if (!isRecording) {
                recognition.start();
                isRecording = true;
                console.log('🎙️ Reconocimiento de voz iniciado...');
            } else {
                recognition.stop();
                isRecording = false;
                console.log('⏹️ Reconocimiento de voz detenido.');
            }
        });
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

