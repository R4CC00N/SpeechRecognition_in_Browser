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
                        currentMode = 'crear';
                        console.log('Dime qué objeto crear (cubo, esfera, plano, cilindro)');
                        scene.emit('enter-create-mode', {}); // Activar modo creación
                    } else if (currentMode === 'crear' && components.some((comp) => transcript.includes(comp))) {
                        const objectType = components.find((comp) => transcript.includes(comp));
                        console.log(`Creación de ${objectType} iniciada.`);
                        // Emitir un evento para el creador de objetos específico
                        scene.emit('start-object-creation', { type: objectType });
                        currentMode = null; // Salir del modo "crear" general
                    }
                });
            }
        });
// Componente de creación de objetos específicos
AFRAME.registerComponent('object-creator', {
    schema: {},

    init: function () {
        const el = this.el;
        const scene = document.querySelector('a-scene');
        let currentObject = null;
        let isCreating = false;

        // Escuchar inicio de creación de un objeto
        scene.addEventListener('start-object-creation', (event) => {
            const objectType = event.detail.type;
            console.log(`Configurando creador para ${objectType}`);
            isCreating = true;

            currentObject = {
                type: objectType,
                color: null,
                position: { x: null, y: null, z: null },
                size: { width: null, height: null, depth: null },
                id: null,
            };

            console.log(`Dime los parámetros para el ${objectType} (color, posición, tamaño, id).`);
        });

        // Escuchar transcripciones mientras se configuran parámetros
        el.addEventListener('transcription', (event) => {
            if (!isCreating || !currentObject) return;

            const transcript = event.detail.transcription.toLowerCase();

            if (transcript.includes('color')) {
                const colorMatch = transcript.match(/color\s(\w+)/);
                if (colorMatch) {
                    currentObject.color = colorMatch[1];
                    console.log(`Color establecido: ${currentObject.color}`);
                }
            } else if (transcript.includes('posición')) {
                const positionMatch = transcript.match(/posición\s(-?\d+),\s*(-?\d+),\s*(-?\d+)/);
                if (positionMatch) {
                    currentObject.position.x = Number(positionMatch[1]);
                    currentObject.position.y = Number(positionMatch[2]);
                    currentObject.position.z = Number(positionMatch[3]);
                    console.log(`Posición establecida: (${currentObject.position.x}, ${currentObject.position.y}, ${currentObject.position.z})`);
                }
            } else if (transcript.includes('tamaño')) {
                const sizeMatch = transcript.match(/tamaño\s(\d+),\s*(\d+),\s*(\d+)/);
                if (sizeMatch) {
                    currentObject.size.width = Number(sizeMatch[1]);
                    currentObject.size.height = Number(sizeMatch[2]);
                    currentObject.size.depth = Number(sizeMatch[3]);
                    console.log(`Tamaño establecido: (${currentObject.size.width}, ${currentObject.size.height}, ${currentObject.size.depth})`);
                }
            } else if (transcript.includes('id')) {
                const idMatch = transcript.match(/id\s(\w+)/);
                if (idMatch) {
                    currentObject.id = idMatch[1];
                    console.log(`ID establecido: ${currentObject.id}`);
                }
            } else if (transcript.includes('finalizar') || transcript.includes('terminar') || transcript.includes('fin')) {
                console.log('Creación finalizada. Generando objeto...');
                createObject(currentObject);
                currentObject = null;
                isCreating = false;
                scene.emit('exit-create-mode', {}); // Salir del modo creación
            }
        });

        // Función para crear el objeto en la escena
        function createObject(config) {
            const entity = document.createElement('a-entity');
            entity.setAttribute('id', config.id);
            entity.setAttribute('geometry', `primitive: box; height: ${config.size.height}; width: ${config.size.width}; depth: ${config.size.depth}`);
            entity.setAttribute('position', `${config.position.x} ${config.position.y} ${config.position.z}`);
            entity.setAttribute('material', `color: ${config.color}`);
            scene.appendChild(entity);
            console.log(`Objeto ${config.type} creado con ID: ${config.id}`);
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
            el.setAttribute('material', 'color:rgb(202, 238, 172)'); // Color azul claro
            console.log('Modo creación activado: color de fondo cambiado.');
        });

        scene.addEventListener('exit-create-mode', () => {
            el.setAttribute('material', 'color: #000000'); // Volver a color negro
            console.log('Modo creación desactivado: color de fondo restaurado.');
        });
    }
});