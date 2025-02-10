    // Componente de reconocimiento de voz
    AFRAME.registerComponent('input-text', {
        schema: {
        message: {type: 'string', default: 'comienza la grabacion!'},
        event: {type: 'string', default: ''},
        },
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

    AFRAME.registerComponent('command-handler', {
        schema: {
            input: { type: 'selector', default: null },
        },
    
        init: function () {
            const el = this.el;
            const inputElement = this.data.input;
            const scene = document.querySelector('a-scene');
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
                console.log('Comando recibido Manejador:', transcript);
                // ❌ Evita entrar en modo creación si ya estás modificando algo
                if (modifyingBox || modifyingSphere) {
                    //console.log('No se puede crear un nuevo objeto mientras se está en modo modificación.');
                    return; // Detener aquí para que no siga ejecutando más lógica
                }
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
                    scene.emit('exit-create-mode');
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
    init: function () {
        const scene = document.querySelector('a-scene');
        let currentObject = null; // Para almacenar referencia al objeto creado

        // Escuchar inicio de creación del objeto
        scene.addEventListener('start-object-creation', (event) => {
            const objectType = event.detail.type;
            console.log(`Creando objeto: ${objectType}`);
            if (objectType === 'cubo') {
                // Definir datos del cubo en JSON
                const cubeData = {
                    id: 'caja',
                    geometry: {
                        primitive: 'box',
                        height: 1,
                        width: 1,
                        depth: 1
                    },
                    position: { x: 0, y: 5, z: -13 },
                    material: { color: '#FFC65D' }
                };
                
                // Crear cubo a partir de JSON
                const entity = document.createElement('a-entity');
                entity.setAttribute('id', cubeData.id);
                entity.setAttribute('geometry', `primitive: ${cubeData.geometry.primitive}; height: ${cubeData.geometry.height}; width: ${cubeData.geometry.width}; depth: ${cubeData.geometry.depth}`);
                entity.setAttribute('position', `${cubeData.position.x} ${cubeData.position.y} ${cubeData.position.z}`);
                entity.setAttribute('material', `color: ${cubeData.material.color}`);
                entity.setAttribute('class', 'dynamic-object'); // ID único para modificarlo después
                scene.appendChild(entity);
                
                console.log('Datos del cubo:', JSON.stringify(cubeData, null, 2));
                
                // Guardar JSON en localStorage (opcional)
                localStorage.setItem('cubeData', JSON.stringify(cubeData));
                // detecta una palabra 
                modifyingBox = true;
                currentObject = entity;
            } else if(objectType === 'esfera'){
                // Definir datos de la esfera en JSON
                const sphereData = {
                    id: 'esfera',
                    geometry: {
                        primitive: 'sphere',
                        radius: 2
                    },
                    position: { x: 5, y: 5, z: -5 },
                    material: { color: 'rgb(255, 93, 193)' }
                };
                
                // Crear esfera a partir de JSON
                const entity = document.createElement('a-entity');
                entity.setAttribute('id', sphereData.id);
                entity.setAttribute('geometry', `primitive: ${sphereData.geometry.primitive}; radius: ${sphereData.geometry.radius}`);
                entity.setAttribute('position', `${sphereData.position.x} ${sphereData.position.y} ${sphereData.position.z}`);
                entity.setAttribute('material', `color: ${sphereData.material.color}`);
                entity.setAttribute('class', 'dynamic-object');
                scene.appendChild(entity);
                
                console.log('Datos de la esfera:', JSON.stringify(sphereData, null, 2));
                
                // Guardar JSON en localStorage (opcional)
                localStorage.setItem('sphereData', JSON.stringify(sphereData));
                // detecta una palabra 
                modifyingSphere = true;
                currentObject = entity;
            } 
            else {
                console.log(`Tipo de objeto no soportado: ${objectType}`);
            }
        });
    },
});

let modifyingBox = false;
let modifyingSphere = false;
let modifyingPlane = false;
let modifyingCilinder = false;
let step = null;
let step_size = null;
// Componente de comandos dinámicos para modificar atributos
AFRAME.registerComponent('dynamic-modifier', {
    schema: {
        input: { type: 'selector', default: null },
    },
    

    init: function () {
        const inputElement = this.data.input;
        const scene = document.querySelector('a-scene');
        let pos={ x: null, y: null, z: null }
        let size={primitive:'box', height: null, width: null, depth: null }
        function updateUserMessage(message) {
            const messageElement = document.querySelector('#userMessage');
            if (messageElement) {
                messageElement.setAttribute('value', message);
            }
        }

        if (!inputElement) {
            console.error('No se ha especificado un elemento de entrada para dynamic-modifier');
            return;
        }

        inputElement.addEventListener('transcription', (event) => {
            let objectType = null
            const transcript = event.detail.transcription.toLowerCase();
            // Procesar comandos solo si estamos en modo modificación
            if (modifyingBox) {
                objectType = 'Cubo'
                console.log('modo modificacion BOX')
                console.log('Comando recibido:', transcript);
                let box_element = document.getElementById("caja");

                updateUserMessage('Que valores quieres darle de estos (Posicion, Tamaño, Color)');
                if(step!=null){
                    // Esperando el valor de X
                    if (step === 'x') {
                        const xMatch = transcript.match(/-?\d+/);
                        if (xMatch) {
                            pos.x = Number(xMatch[0]);
                            console.log('Posición X capturada:', pos.x);
                            box_element.setAttribute('position', pos);
                            step = 'y';  // Pasamos al siguiente paso
                            updateUserMessage('¿Qué valor en Y?');
                        } else {
                            updateUserMessage('Por favor, dime un número para X.');
                        }
                        return;
                    }

                    // Esperando el valor de Y
                    if (step === 'y') {
                        const yMatch = transcript.match(/-?\d+/);
                        if (yMatch) {
                            pos.y = Number(yMatch[0]);
                            console.log('Posición Y capturada:', pos.y);
                            box_element.setAttribute('position', pos);
                            step = 'z';  // Pasamos al siguiente paso
                            updateUserMessage('¿Qué valor en Z?');
                        } else {
                            updateUserMessage('Por favor, dime un número para Y.');
                        }
                        return;
                    }

                    // Esperando el valor de Z
                    if (step === 'z') {
                        const zMatch = transcript.match(/-?\d+/);
                        if (zMatch) {
                            pos.z = Number(zMatch[0]);
                            console.log('Posición Z capturada:', pos.z);
                            // Aplicar los cambios al cubo en la escena
                            box_element.setAttribute('position', pos);
                            console.log('position: ',pos)
                            // Reiniciar el flujo
                            step = null;
                        } else {
                            updateUserMessage('Por favor, dime un número para Z.');
                        }
                        return;
                    }
                }else if(step_size!=null){
                    if(step_size==='size'){
                        const sizeMatch = transcript.match(/-?\d+/);
                        if (sizeMatch) {
                            size.height = Number(sizeMatch[0]);
                            size.width = Number(sizeMatch[0]);
                            size.depth = Number(sizeMatch[0]);
                            console.log('Tamaño capturado',size);
                            // Aplicar los cambios al cubo en la escena
                            box_element.setAttribute('geometry', size);
                            // Reiniciar el flujo
                            step_size = null;
                        } else {
                            updateUserMessage('Por favor, dime un tamaño para el objeto');
                        }
                        return;
                    }
                } else{
                    // Si el usuario dice "posición", iniciamos el flujo de captura de coordenadas
                    if (step === null && transcript.includes('posición')) {
                        step = 'x';
                        updateUserMessage('¿Qué valor en X?');
                        return;
                    }else if (transcript.includes('tamaño')) {
                        step_size = 'size'
                        updateUserMessage('que tamaño?');
                        return;
                    } else if (transcript.includes('color')) {
                        console.log('funciona color')
                    }else if (transcript.includes('cambio')) {
                        console.log('funciona salir')
                        modifyingBox=false
                        updateUserMessage(`se ha terminado de crear el ${objectType}`);
                        scene.emit('exit-create-mode')
                    }
    
                }                

                
            }else if(modifyingSphere){
                objectType = 'Esfera'
                console.log('modo modificacion SPHERE')
                console.log('Comando recibido:', transcript);
                if (transcript.includes('posición')) {
                    console.log('funciona posicion')
                } else if (transcript.includes('tamaño')) {
                    console.log('funciona tamaño')
                } else if (transcript.includes('color')) {
                    console.log('funciona color')
                }else if (transcript.includes('cambio')) {
                    console.log('funciona salir')
                    modifyingSphere=false
                    updateUserMessage(`se ha terminado de crear el ${objectType}`);
                    scene.emit('exit-create-mode')
                }
            }
        });
    },
});

    
AFRAME.registerComponent('sky-manager', {
    schema: {
        createMode: { type: 'boolean', default: false }
    },
  
    init: function () {
        const el = this.el;
        const scene = document.querySelector('a-scene');

        // Verifica si está en modo creación al iniciar
        this.updateSky(this.data.createMode);

        // Escucha eventos para cambiar el color de fondo
        scene.addEventListener('enter-create-mode', () => {
            this.updateSky(true);
        });

        scene.addEventListener('exit-create-mode', () => {
            this.updateSky(false);
        });
    },

    updateSky: function (isCreateMode) {
        const el = this.el;
        if (isCreateMode) {
            el.setAttribute('material', 'color: rgb(201, 224, 158)'); // Verde claro
            console.log('Modo creación activado: color de fondo cambiado.');
        } else {
            el.setAttribute('material', 'color: rgb(196, 196, 196)'); // Color neutro
            console.log('Modo creación desactivado: color de fondo restaurado.');
        }
    }
});