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
                // Evita entrar en modo creación si ya estás modificando algo
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
                const text = document.createElement('a-text');
                entity.setAttribute('id', cubeData.id);
                entity.setAttribute('geometry', `primitive: ${cubeData.geometry.primitive}; height: ${cubeData.geometry.height}; width: ${cubeData.geometry.width}; depth: ${cubeData.geometry.depth}`);
                entity.setAttribute('position', `${cubeData.position.x} ${cubeData.position.y} ${cubeData.position.z}`);
                entity.setAttribute('material', `color: ${cubeData.material.color}`);
                entity.setAttribute('class', 'dynamic-object'); // ID único para modificarlo después
                

                text.setAttribute('value', cubeData.id);
                text.setAttribute('position', '0 1 0'); // Ajustar la posición para que se vea
                text.setAttribute('align', 'center');
                text.setAttribute('color', 'white');
                text.setAttribute('width', '4');

                entity.appendChild(text);
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
                const text = document.createElement('a-text');
                entity.setAttribute('id', sphereData.id);
                entity.setAttribute('geometry', `primitive: ${sphereData.geometry.primitive}; radius: ${sphereData.geometry.radius}`);
                entity.setAttribute('position', `${sphereData.position.x} ${sphereData.position.y} ${sphereData.position.z}`);
                entity.setAttribute('material', `color: ${sphereData.material.color}`);
                entity.setAttribute('class', 'dynamic-object');
                
                text.setAttribute('value', sphereData.id);
                text.setAttribute('position', `0 ${sphereData.geometry.radius+(sphereData.geometry.radius/2)} 0`); // Ajustar la posición para que se vea
                text.setAttribute('align', 'center');
                text.setAttribute('color', 'white');
                text.setAttribute('width', '4');

                entity.appendChild(text);
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

// Componente de comandos dinámicos para modificar atributos
AFRAME.registerComponent('dynamic-modifier', {
    schema: {
        input: { type: 'selector', default: null },
    },
    
    init: function () {
        const inputElement = this.data.input;
        const scene = document.querySelector('a-scene');
        const colorsMap = {
            'rojo': 'red',
            'azul': 'blue',
            'verde': 'green',
            'amarillo': 'yellow',
            'negro': 'black',
            'blanco': 'white',
            'naranja': 'orange',
            'morado': 'purple',
            'rosa': 'pink',
            'gris': 'gray',
            'marrón': 'brown'
        };

        function updateUserMessage(message) {
            const messageElement = document.querySelector('#userMessage');
            if (messageElement) {
                messageElement.setAttribute('value', message);
            }
        }
        function getLastCreatedEntity() {
            const entities = document.querySelectorAll('a-entity');
            if (entities.length > 0) {
                return entities[entities.length - 1]; // Devuelve el último creado
            }
            return null; // Si no hay entidades, retorna null
        }

        

        function stepsPOS(posKey, entity, transcript){
            const match = transcript.match(/-?\d+(\.\d+)?/);
            if (match) {
                entity[posKey] = parseFloat(match[0]);
                entity.setAttribute('position', entity);
                step = (posKey === 'x') ? 'y' : (posKey === 'y') ? 'z' : null;
                if (step) updateUserMessage(`¿Qué valor en ${step}?`);
            } else {
                updateUserMessage(`Por favor, dime un número para ${posKey}.`);
            }
        }
        function stepCOLOR(entity,transcript){
            const colorMatch = transcript.toLowerCase();
            console.log('awaaaaaaaa',colorMatch);
            const matchedColor = Object.keys(colorsMap).find(color => colorMatch.includes(color));
            if (matchedColor) {
                entity.components.material.attrValue.color = colorsMap[matchedColor];
                console.log('weeeeeeeeee', entity.components.material.attrValue);
                entity.setAttribute('material', entity.components.material.attrValue);
                // Reiniciar el flujo
                step = null;
            } else {
                updateUserMessage('Por favor, dime un color válido para el objeto');
            }
            return;
        }
        function stepID(entity,transcript){
            const idMatch = transcript.toLowerCase();
            console.log('NUEVO id',idMatch.replace(/\.$/, ''));
            entity.id = idMatch.replace(/\.$/, '');
            console.log('weeeeeeeeee', entity.id);
            entity.setAttribute('id', entity.id);
                // Si quieres modificar el valor de un input dentro de box_element
            const entity_child = entity.querySelector('a-text');
            if (entity_child) {
                entity_child.setAttribute('value', entity.id);
            }
            // Reiniciar el flujo
            step = null;
            return;
        }
        function stepSIZE(entity,transcript){
            const excludeKeys = ['primitive','phiLength','phiStart','segmentsHeight','segmentsWidth','segmentsDepth','thetaLength','thetaStart']
            const sizeMatch = transcript.match(/-?\d+(\.\d+)?/); // Captura enteros y decimales

            if (sizeMatch) {
                const newSize = parseFloat(sizeMatch[0]);
        
                Object.keys(entity.components.geometry.oldData).forEach(key => {
                    if (!excludeKeys.includes(key)) {
                        entity.components.geometry.oldData[key] = newSize;
                    }
                });
        
                console.log('Tamaño capturado:', entity.components.geometry.oldData);
                
                // Aplicar los cambios al cubo en la escena
                entity.setAttribute('geometry', entity.components.geometry.oldData);

                // Reiniciar el flujo
                step = null;
            } else {
                updateUserMessage('Por favor, dime un tamaño para el objeto');
            }
            return;

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
                objectType = 'Cubo';
                console.log('Modo modificación BOX');
                console.log('Comando recibido:', transcript);
            
                let entity = getLastCreatedEntity();
                console.log('Entidad ID:', entity.id);
                console.log('sizze?? ',entity.components.geometry.oldData)
                
                updateUserMessage('¿Qué valores quieres modificar? (Posición, Tamaño, Color, ID)');
            
                if (step) {
                    // Mapeo de acciones según el valor de `step`
                    const stepActions = {
                        'x': () => stepsPOS('x', entity, transcript),
                        'y': () => stepsPOS('y', entity, transcript),
                        'z': () => stepsPOS('z', entity, transcript),
                        'size': () => stepSIZE(entity, transcript),
                        'color': () => stepCOLOR(entity, transcript),
                        'id': () => stepID(entity, transcript),
                    };
            
                    if (stepActions[step]) {
                        stepActions[step](); // Llama a la función correspondiente
                    }
                    return;
                }
            
                // Detección de palabras clave para iniciar un nuevo flujo
                const keywordActions = {
                    'posición': { step: 'x', message: '¿Qué valor en X?' },
                    'tamaño': { step: 'size', message: '¿Qué tamaño?' },
                    'color': { step: 'color', message: '¿Qué color?' },
                    'id': { step: 'id', message: '¿Qué ID?' },
                    'cambio': { exit: true },
                };
            
                for (const keyword in keywordActions) {
                    if (transcript.includes(keyword)) {
                        if (keywordActions[keyword].exit) {
                            console.log('Saliendo del modo modificación');
                            modifyingBox = false;
                            updateUserMessage(`Se ha terminado de modificar el ${objectType}`);
                            scene.emit('exit-create-mode');
                        } else {
                            step = keywordActions[keyword].step;
                            updateUserMessage(keywordActions[keyword].message);
                        }
                        return;
                    }
                }
            }
            else if(modifyingSphere){
                objectType = 'Esfera'
                console.log('modo modificacion SPHERE')

                console.log('Comando recibido:', transcript);
                let entity = getLastCreatedEntity();
                console.log('Entidad ID:', entity.id);
                console.log('sizze?? ',entity.components.geometry.oldData)
                updateUserMessage('¿Qué valores quieres modificar? (Posición, Tamaño, Color, ID)');
            
                if (step) {
                    // Mapeo de acciones según el valor de `step`
                    const stepActions = {
                        'x': () => stepsPOS('x', entity, transcript),
                        'y': () => stepsPOS('y', entity, transcript),
                        'z': () => stepsPOS('z', entity, transcript),
                        'size': () => stepSIZE(entity, transcript),
                        'color': () => stepCOLOR(entity, transcript),
                        'id': () => stepID(entity, transcript),
                    };
            
                    if (stepActions[step]) {
                        stepActions[step](); // Llama a la función correspondiente
                    }
                    return;
                }
            
                // Detección de palabras clave para iniciar un nuevo flujo
                const keywordActions = {
                    'posición': { step: 'x', message: '¿Qué valor en X?' },
                    'tamaño': { step: 'size', message: '¿Qué tamaño?' },
                    'color': { step: 'color', message: '¿Qué color?' },
                    'id': { step: 'id', message: '¿Qué ID?' },
                    'cambio': { exit: true },
                };
            
                for (const keyword in keywordActions) {
                    if (transcript.includes(keyword)) {
                        if (keywordActions[keyword].exit) {
                            console.log('Saliendo del modo modificación');
                            modifyingSphere = false;
                            updateUserMessage(`Se ha terminado de modificar el ${objectType}`);
                            scene.emit('exit-create-mode');
                        } else {
                            step = keywordActions[keyword].step;
                            updateUserMessage(keywordActions[keyword].message);
                        }
                        return;
                    }
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