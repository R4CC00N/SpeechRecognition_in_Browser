// Componente de reconocimiento de voz
AFRAME.registerComponent('input-text', {
    init: function () {
        var el = this.el;
        var recognition;
        var isRecording = false;

        // Verificar compatibilidad con la API de reconocimiento de voz
        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'es-ES';
        } else {
            console.error('API de reconocimiento de voz no soportada en este navegador');
        }

        // Función para convertir texto a números, incluyendo negativos
        function convertirTextoANumero(texto) {
            const mapaNumeros = {
                'cero': 0, 'uno': 1, 'dos': 2, 'tres': 3, 'cuatro': 4,
                'cinco': 5, 'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10
            };
            texto = texto.toLowerCase();
            return texto.replace(/\b(menos\s)?(\w+)\b/g, (match, menos, palabra) => {
                const numero = mapaNumeros[palabra] !== undefined ? mapaNumeros[palabra] : isNaN(Number(palabra)) ? match : Number(palabra);
                return menos ? -numero : numero;
            });
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
                }
            } else {
                if (recognition) {
                    recognition.stop();
                    isRecording = false;
                    updateUserMessage('Reconocimiento de voz detenido.');
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

                // Convertir los números en el texto
                transcript = convertirTextoANumero(transcript);
                // Mostrar transcripción procesada en el HUD
                //updateUserMessage(`Transcripción: ${transcript}`);
                // Pasar la transcripción al siguiente componente
                el.emit('transcription', { transcription: transcript });
            };

            recognition.onerror = (event) => {
                console.error('Error en el reconocimiento de voz:', event.error);
                updateUserMessage('Error en reconocimiento de voz.');
            };
        }
    }
});

// Componente de manejo de comandos con entrada configurable
AFRAME.registerComponent('command-handler', {
    schema: {
        input: { type: 'selector', default: null }, // Selector del elemento que genera eventos
    },

    init: function () {
        const el = this.el;
        const inputElement = this.data.input; // Elemento especificado como entrada
        const scene = document.querySelector('a-scene');
        const components = ['cubo', 'esfera', 'plano', 'cilindro'];
        let currentCommand = null;

        if (!inputElement) {
            console.error('No se ha especificado un elemento de entrada para command-handler');
            return;
        }

        // Actualizar el mensaje del usuario en la escena
        function updateUserMessage(message) {
            const messageElement = document.querySelector('#userMessage');
            if (messageElement) {
                messageElement.setAttribute('value', message);
            }
        }

        // Escuchar eventos de transcripción desde el elemento especificado
        inputElement.addEventListener('transcription', (event) => {
            const transcript = event.detail.transcription.toLowerCase();
            console.log('Comando recibido:', transcript);

            if (transcript.includes('crear')) {
                currentCommand = 'crear';
                updateUserMessage('Dime qué objeto crear (cubo, esfera, plano, cilindro)');
            } else if (currentCommand === 'crear' && components.some((comp) => transcript.includes(comp))) {
                const objectType = components.find((comp) => transcript.includes(comp));
                updateUserMessage(`Creando un ${objectType}. Ahora dime la posición x.`);
                currentCommand = { type: 'crear', object: objectType, position: { x: null, y: null, z: null }, size: null, step: 'x' };
            } else if (currentCommand && currentCommand.step === 'x' && transcript.includes('x')) {
                const xMatch = transcript.match(/(-?\d+)/);
                if (xMatch) {
                    currentCommand.position.x = Number(xMatch[0]);
                    updateUserMessage(`Posición x: ${currentCommand.position.x}. Ahora dime la posición y.`);
                    currentCommand.step = 'y';
                }
            } else if (currentCommand && currentCommand.step === 'y' && transcript.includes('y')) {
                const yMatch = transcript.match(/(-?\d+)/);
                if (yMatch) {
                    currentCommand.position.y = Number(yMatch[0]);
                    updateUserMessage(`Posición y: ${currentCommand.position.y}. Ahora dime la posición z.`);
                    currentCommand.step = 'z';
                }
            } else if (currentCommand && currentCommand.step === 'z' && transcript.includes('z')) {
                const zMatch = transcript.match(/(-?\d+)/);
                if (zMatch) {
                    currentCommand.position.z = Number(zMatch[0]);
                    updateUserMessage('Dime el tamaño.');
                    currentCommand.step = 'size';
                }
            } else if (currentCommand && currentCommand.step === 'size' && transcript.includes('tamaño')) {
                const sizeMatch = transcript.match(/(-?\d+)/);
                if (sizeMatch) {
                    currentCommand.size = Number(sizeMatch[0]);
                    updateUserMessage(`Creando ${currentCommand.object} en posición (${currentCommand.position.x}, ${currentCommand.position.y}, ${currentCommand.position.z}) con tamaño ${currentCommand.size}.`);

                    const entity = document.createElement('a-entity');
                    if (currentCommand.object === 'cubo') {
                        entity.setAttribute('geometry', `primitive: box; height: ${currentCommand.size}; width: ${currentCommand.size}; depth: ${currentCommand.size}`);
                    } else if (currentCommand.object === 'esfera') {
                        entity.setAttribute('geometry', `primitive: sphere; radius: ${currentCommand.size / 2}`);
                    } else if (currentCommand.object === 'plano') {
                        entity.setAttribute('geometry', `primitive: plane; height: ${currentCommand.size}; width: ${currentCommand.size}`);
                    } else if (currentCommand.object === 'cilindro') {
                        entity.setAttribute('geometry', `primitive: cylinder; radius: ${currentCommand.size / 2}; height: ${currentCommand.size}`);
                    }
                    entity.setAttribute('position', `${currentCommand.position.x} ${currentCommand.position.y} ${currentCommand.position.z}`);
                    entity.setAttribute('material', 'color: #FFC65D');
                    scene.appendChild(entity);

                    currentCommand = null;
                }
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
            const planeText = el.querySelector('a-text');

            if (planeText) {
                planeText.setAttribute('value', transcript);
            } else {
                console.warn('No se encontró a-text dentro de transcription-display para mostrar la transcripción');
            }
        });
    }
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

        scene.addEventListener('exit-create-mode', () => {
            el.setAttribute('material', 'color: #000000'); // Volver a color negro
            console.log('Modo creación desactivado: color de fondo restaurado.');
        });
    }
});