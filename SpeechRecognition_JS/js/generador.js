// Componente de reconocimiento de voz
AFRAME.registerComponent('input-text', {
    schema: {
        message: { type: 'string', default: 'Comienza la grabación!' },
        event: { type: 'string', default: '' },
    },
    init: function () {
        const el = this.el;
        let recognition;
        let isRecording = false;


        // Verificar compatibilidad con la API de reconocimiento de voz
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'es-ES';
        } else {
            console.error('API de reconocimiento de voz no soportada en este navegador');
        }

        // Actualizar el mensaje del usuario en la escena
        function updateUserMessage(message) {
            const messageElement = document.querySelector('#userMessage');
            if (messageElement) {
                messageElement.setAttribute('value', message);
            }
        }

        // Iniciar/Detener grabación al hacer clic
        el.addEventListener('click', () => {
            if (!isRecording) {
                if (recognition) {
                    recognition.start();
                    isRecording = true;
                    updateUserMessage('Reconocimiento de voz iniciado...');
                    el.setAttribute('color', '#4CAF50');
                }
            } else {
                if (recognition) {
                    recognition.stop();
                    isRecording = false;
                    updateUserMessage('Reconocimiento de voz detenido.');
                    el.setAttribute('color','#FF6B6B');
                }
            }
        });

        // Cuando se recibe un resultado de la transcripción
        if (recognition) {
            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }
                console.log('Transcripción:', transcript);

                // Actualizar el texto en la escena
                const transcriptionText = document.querySelector('#transcriptionText');
                if (transcriptionText) {
                    transcriptionText.setAttribute('value', transcript);
                }
            };

            recognition.onerror = (event) => {
                console.error('Error en el reconocimiento de voz:', event.error);
                updateUserMessage('Error en reconocimiento de voz.');
            };
        }
    }
});


    AFRAME.registerComponent('command-handler', {
        schema: {
            input: { type: 'selector', default: null },
        },
    
        init: function () {
            const el = this.el;
            const inputElement = this.data.input;
            const scene = document.querySelector('#main');
            const components = ['cubo', 'esfera', 'plano', 'cilindro'];
            let currentCommand = null;
    
            if (!inputElement) {
                console.error('No se ha especificado un elemento de entrada para command-handler');
                return;
            }
    
            function updateUserMessage(message) {
                const messageElement = document.querySelector('#userMessage');
                if (messageElement) {
                    messageElement.setAttribute('value', message);
                }
            }
    
            inputElement.addEventListener('transcription', (event) => {
                const transcript = event.detail.transcription.toLowerCase();
                console.log('Comando recibido:', transcript);
    
                if (transcript.includes('crear')) {
                    currentCommand = 'crear';
                    updateUserMessage('Dime qué objeto crear (cubo, esfera, plano, cilindro)');
                    scene.emit('enter-create-mode');
                } else if (currentCommand === 'crear' && components.some((comp) => transcript.includes(comp))) {
                    const objectType = components.find((comp) => transcript.includes(comp));
                    updateUserMessage(`Creando un ${objectType}.`);
                    currentCommand = null; // Resetear el comando
                    // Emitir un evento para iniciar la creación en object-creator
                    scene.emit('start-object-creation', { type: objectType });
                } else if (transcript.includes('salir')) {
                    currentCommand = 'fin';
                    updateUserMessage('Terminando creación');
                    scene.emit('end-create-mode');
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

    // Componente para crear objetos
AFRAME.registerComponent('object-creator', {
    schema: {
        input: { type: 'selector', default: null },
    },

    init: function () {
        const scene = document.querySelector('a-scene');

        scene.addEventListener('start-object-creation', (event) => {
            const objectType = event.detail.type;
            console.log(`Creando objeto: ${objectType}`);

            const entity = document.createElement('a-entity');
            let geometry = {};

            switch (objectType) {
                case 'cubo':
                    geometry = { primitive: 'box', height: 1, width: 1, depth: 1 };
                    break;
                case 'esfera':
                    geometry = { primitive: 'sphere', radius: 2.5 };
                    break;
                case 'plano':
                    geometry = { primitive: 'plane', height: 1, width: 7 };
                    break;
                case 'cilindro':
                    geometry = { primitive: 'cylinder', height: 4, radius: 0.5 };
                    break;
                default:
                    console.error(`Tipo de objeto no soportado: ${objectType}`);
                    return;
            }

            entity.setAttribute('geometry', geometry);
            entity.setAttribute('position', '0 5 -13');
            entity.setAttribute('rotation', '0 0 90');
            entity.setAttribute('material', 'color:rgb(255, 0, 0)');
            scene.appendChild(entity);
        });
    },
});
    
    // Componente para manejar el fondo (sky)
    AFRAME.registerComponent('sky-manager', {
        init: function () {
            const el = this.el;
            const scene = document.querySelector('a-scene');

            // Cambiar el color del fondo al entrar/salir del modo creación
            scene.addEventListener('enter-create-mode', () => {
                el.setAttribute('material', 'color: #87CEEB'); // Color azul claro
                console.log('Modo creación activado: color de fondo cambiado.');
            });
            scene.addEventListener('end-create-mode', () => {
                el.setAttribute('material', 'color:rgb(255, 198, 132)'); // Volver
                console.log('Modo creación desactivado: color de fondo restaurado.');
            });
            scene.addEventListener('exit-create-mode', () => {
                el.setAttribute('material', 'color:rgb(126, 126, 126)'); // Volver
                console.log('Modo creación desactivado: color de fondo restaurado.');
            });
        }
    });