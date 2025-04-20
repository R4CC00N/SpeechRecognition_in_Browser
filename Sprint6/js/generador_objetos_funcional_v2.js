// ------------------------- FUNCIONES -------------------------------

// Función para actualizar el mensaje del usuario
function updateUserMessage(message,mode) {
    const messageElement = document.querySelector('#userMessage');
    const messageElementType2 = document.querySelector('#typeMessage');
    if (messageElement && mode==='msg') {
        messageElement.setAttribute('value', message);
    }else if (messageElementType2 && mode==='info') {
        messageElementType2.setAttribute('value', message);
    }
}
// Captura de posición
function stepsPOS(posKey, entity, transcript) {
    const match = transcript.match(/-?\d+(\.\d+)?/);
    if (match) {
    const newPos = parseFloat(match[0]);
    const position = entity.getAttribute('position');
    position[posKey] = newPos;
    entity.setAttribute('position', position);

    // Avanza al siguiente eje
    step = posKey === 'x' ? 'y' : posKey === 'y' ? 'z' : null;
    updateUserMessage(step ? `¿Qué valor en POS ${step}?` : 'Posición completa. ¿Qué valores quieres modificar?','msg');
    updateUserMessage('Posición\nRotación\nTamaño\nColor\nID', 'info');
    } else {
    updateUserMessage(`Por favor, dime un número para POS ${posKey}.`,'msg');
    }
}

// Captura de rotacion
function stepsROT(posKey, entity, transcript) {
    const match = transcript.match(/-?\d+(\.\d+)?/);
    if (match) {
        const newRotation = parseFloat(match[0]);
        const rotation = entity.getAttribute('rotation');

        // Asignar el nuevo valor al eje correspondiente
        rotation[posKey] = newRotation;

        // Aplicar la rotación a la entidad
        entity.setAttribute('rotation', rotation);
        console.log(entity)
        // Avanzar al siguiente eje
        step = posKey === 'x' ? 'y-rot' : posKey === 'y' ? 'z-rot' : null;
        updateUserMessage(step ? `¿Qué valor en ${step}?` : 'Rotación completa. ¿Qué valores quieres modificar?','msg');
        updateUserMessage('Posición\nRotación\nTamaño\nColor\nID', 'info');
    } else {
        updateUserMessage(`Por favor, dime un número para ROT ${posKey}.`,'msg');
    }
}

// Captura de color
function stepCOLOR(entity, transcript) {
    const lowerTranscript = transcript.toLowerCase().trim();

    // Reemplazar alias en el transcript por el color base
    let replacedTranscript = lowerTranscript;
    Object.keys(colorAliases).forEach(alias => {
        if (replacedTranscript.includes(alias)) {
            replacedTranscript = replacedTranscript.replace(alias, colorAliases[alias]);
        }
    });

    const matchedColor = Object.keys(colorsMap).find(color => replacedTranscript.includes(color));
    const entityChild = entity.querySelector('a-light');
      if (matchedColor) {
          // Cambiar color del material de la entidad principal
          entity.setAttribute('material', 'color', colorsMap[matchedColor]);
      
          // Si tiene luz, cambiar también el color de la luz
          if (entityChild) {
              entityChild.setAttribute('light', 'color', colorsMap[matchedColor]);
          }
      
          step = null;
          updateUserMessage('Color modificado. ¿Qué valores quieres modificar?','msg');
          updateUserMessage('Posición\nRotación\nTamaño\nColor\nID', 'info');
      } else {
          updateUserMessage('Por favor, dime un color válido para el objeto.','msg');
      }
  }
        
// Captura de ID
function stepID(entity, transcript) {
    const idMatch = transcript.trim().toLowerCase().replace(/\.$/, '');
    entity.id = idMatch;
    entity.setAttribute('id', entity.id);
    
    const entityChild = entity.querySelector('a-text');
    if (entityChild) {
        entityChild.setAttribute('value', entity.id);
    }
    step = null;
    updateUserMessage('ID modificado. ¿Qué valores quieres modificar?','msg');
    updateUserMessage('Posición\nRotación\nTamaño\nColor\nID', 'info');
}
        
// Captura de tamaño
function stepSIZE(entity, transcript) {
    const excludeKeys = [
    'primitive', 'phiLength', 'phiStart', 'segmentsHeight', 'segmentsWidth', 
    'segmentsDepth', 'thetaLength', 'thetaStart'
    ];
    const sizeMatch = transcript.match(/-?\d+(\.\d+)?/);
    const newSize = parseFloat(sizeMatch[0]);
    if (sizeMatch) {
        Object.keys(entity.components.geometry.oldData).forEach(key => {
            if (!excludeKeys.includes(key)) {
            entity.components.geometry.oldData[key] = newSize;
            }
        });
        entity.setAttribute('geometry', entity.components.geometry.oldData);
        step = null;
        updateUserMessage('Tamaño modificado. ¿Qué valores quieres modificar?','msg');
        updateUserMessage('Posición\nRotación\nTamaño\nColor\nID', 'info');
    } else {
        updateUserMessage('Por favor, dime un tamaño para el objeto.','msg');
    }
    const entityChild = entity.querySelector('a-text');
    const entityChildlight = entity.querySelector('a-light');
    if (entityChild) {
        console.log('child: ', entityChild);
    
        // Verificar si el objeto es una esfera o un cilindro/torus y calcular la "altura" adecuada
        let objectHeight;
    
        if (entity.components.geometry && entity.components.geometry.oldData) {
            // Si es esfera, usamos el radio como altura
            if (entity.components.geometry.oldData.radius) {
                objectHeight = entity.components.geometry.oldData.radius;
                // Calcular la posición Y para el texto (1 unidad por encima del tope)
                const textY = objectHeight + 0.5;// Colocamos el texto justo encima, 0.5 unidades más arriba
                console.log('child posY: ', textY);
                console.log('objectHeight: ', objectHeight);
    
                // Establecer la nueva posición del texto
                entityChild.setAttribute('position', `0 ${textY} 0`);
            }
            // Si es un cilindro o torus, usamos la altura
            else if (entity.components.geometry.oldData.height) {
                objectHeight = entity.components.geometry.oldData.height;
                                // Calcular la posición Y para el texto (1 unidad por encima del tope)
                const textY = objectHeight/2 + 1;// Colocamos el texto justo encima, 0.5 unidades más arriba
                console.log('child posY: ', textY);
                console.log('objectHeight: ', objectHeight);
    
                // Establecer la nueva posición del texto
                 entityChild.setAttribute('position', `0 ${textY} 0`);
            } else {
                objectHeight = 1; // Fallback si no tiene ni altura ni radio
            }
        } else {
            objectHeight = 1; // Fallback si no hay datos de geometría
        }
    
        
    }
    if(entityChildlight){
        console.log('intensidad: ', entityChildlight);
        entityChildlight.setAttribute('intensity', newSize);
        entity.setAttribute('geometry', 'radius','0.05');
        entityChild.setAttribute('position', '0 1 0');
        step = null;
    }
            
} 

// Obtener objeto por ID
function getEntityById(id) {
    return document.querySelector(`#${id}`);
}

// Obtener la última entidad creada
function getLastCreatedEntity() {
  const entities = document.querySelectorAll('a-entity');
  if (entities.length > 0) {
    return entities[entities.length - 1]; // Devuelve el último creado
  }
  return null; // Si no hay entidades, retorna null
}

// Función para crear el torus y elementos asociados
function createTorus() {
    // podriamos solicitar entity para hacer lo mismo que en los nombres del ID
    const group = document.createElement('a-entity');
    group.setAttribute('id', 'edit');
    // Crear el torus
    const torusElement = document.createElement('a-torus');
    torusElement.setAttribute('rotation', '90 0 0');
    torusElement.setAttribute('position', '0 -1 0');
    torusElement.setAttribute('radius', '1.25');
    torusElement.setAttribute('radius-tubular', '0.025');
    torusElement.setAttribute('material', 'color: #b2ff00; emissive: green;');

    // Crear el cilindro en la posición del torus con los mismos parámetros
    const cylinderElement = document.createElement('a-cylinder');
    cylinderElement.setAttribute('position', '0 0.5 0'); // Mismo centro que el torus
    cylinderElement.setAttribute('height', '3');  // Altura del cilindro
    cylinderElement.setAttribute('radius', '1.1'); // Radio del cilindro
    cylinderElement.setAttribute('material', 'color: #b2ff00; emissive: green;'); // Color del cilindro
    cylinderElement.setAttribute('opacity', '0.15'); // Opacidad del cilindro
    cylinderElement.setAttribute('shadow', ''); // Habilitar sombra

    // Agregar el torus y el cilindro al grupo
    group.appendChild(cylinderElement);
    group.appendChild(torusElement);

    return group;
}

// -----------------------------------------------------------

// --------------------- VARIABLES Y CONSTANTES ---------------
let modifyingBox = false;
let modifyingSphere = false;
let modifyingPlane = false;
let modifyingCylinder = false;
let modifyingLight = false;
let modifyingConteiner = false;
let modifyingRadio = false;
let step = null;
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
    'marrón': 'brown',
};
const colorAliases = {
    'rojito': 'rojo',
    'roji': 'rojo',
    'azulito': 'azul',
    'verdecito': 'verde',
    'amarillito': 'amarillo',
    'negrito': 'negro',
    'blanquito': 'blanco',
    'naranjita': 'naranja',
    'lila': 'morado',
    'violeta': 'morado',
    'rosita': 'rosa',
    'grisecito': 'gris',
    'cafecito': 'marrón',
    'café': 'marrón',
    'celeste': 'azul', // o un color aparte si querés

    // Inglés directo
    'red': 'rojo',
    'blue': 'azul',
    'green': 'verde',
    'yellow': 'amarillo',
    'black': 'negro',
    'white': 'blanco',
    'orange': 'naranja',
    'purple': 'morado',
    'pink': 'rosa',
    'gray': 'gris',
    'brown': 'marrón',
};

//-------------------------------------------------------------

//--------------- COMPONENTES ---------------------------------

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

            // Iniciar/Detener grabación al hacer clic
            el.addEventListener('click', () => {
                if (!isRecording) {
                    if (recognition) {
                        recognition.start();
                        isRecording = true;
                        updateUserMessage('Reconocimiento de voz iniciado...','msg');
                    }
                } else {
                    if (recognition) {
                        recognition.stop();
                        isRecording = false;
                        updateUserMessage('Reconocimiento de voz detenido.','msg');
                        
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

AFRAME.registerComponent('command-handler', {
    schema: {
        input: { type: 'selector', default: null },
    },

    init: function () {
        const el = this.el;
        const inputElement = this.data.input;
        const scene = document.querySelector('a-scene');
        const components = ['cubo', 'esfera', 'plano', 'cilindro', 'luz'];
        const assets = ['contenedor', 'radio'];
        let currentCommand = null;

        if (!inputElement) {
            console.error('No se ha especificado un elemento de entrada para command-handler');
            return;
        }

        inputElement.addEventListener('transcription', (event) => {
            const transcript = event.detail.transcription.toLowerCase();
            console.log('Comando recibido Manejador:', transcript);

            // Bloqueo si estamos modificando un objeto
            if (modifyingBox || modifyingSphere|| modifyingPlane|| modifyingConteiner|| modifyingLight|| modifyingCylinder|| modifyingRadio) return;
            // Si estamos en modo crear y ya dijimos "crear", permitimos avanzar
            if (currentCommand && !['crear', 'assets'].includes(currentCommand)) {
                // Si no es salir/atrás, ignorar nuevos comandos
                if (!transcript.includes('salir') && !transcript.includes('atrás') && !transcript.includes('cambio')) {
                    console.log(`Comando ignorado. Ya hay uno activo: ${currentCommand}`);
                    return;
                }
            }

            // SALIR o ATRÁS — cancelar cualquier modo activo
            if (transcript.includes('salir') || transcript.includes('atrás')|| transcript.includes('cambio')) {
                currentCommand = null;
                updateUserMessage('Saliendo del modo actual.', 'msg');
                updateUserMessage('...', 'info');
                scene.emit('exit-create-mode');
                return;
            }

            // INICIO DE MODO CREAR
            if (transcript.includes('crear') && currentCommand !== 'crear') {
                currentCommand = 'crear';
                updateUserMessage('Dime qué objeto crear:', 'msg');
                updateUserMessage('cubo\nesfera\nplano\ncilindro\nluz\nassets', 'info');
                scene.emit('enter-create-mode');
                return;
            }

            // MODO CREAR: elección de componente
            if (currentCommand === 'crear' && components.some((comp) => transcript.includes(comp))) {
                const objectType = components.find((comp) => transcript.includes(comp));
                updateUserMessage(`Creando un ${objectType}.`, 'msg');
                scene.emit('start-object-creation', { type: objectType });
                currentCommand = null; // Fin de creación
                return;
            }

            // MODO CREAR: assets
            if (currentCommand === 'crear' && transcript.includes('assets')) {
                currentCommand = 'assets';
                updateUserMessage(`¿Qué asset quieres crear?`, 'msg');
                updateUserMessage(`Assets disponibles:\n- ${assets.join('\n- ')}`, 'info');
                return;
            }

            if (currentCommand === 'assets' && assets.some((asset) => transcript.includes(asset))) {
                const objectType = assets.find((asset) => transcript.includes(asset));
                updateUserMessage(`Creando un ${objectType}.`, 'msg');
                scene.emit('start-object-creation', { type: objectType });
                currentCommand = null;
                return;
            }

            // EDITAR
            if (transcript.includes('editar')) {
                currentCommand = 'editar';
                scene.emit('edit-mode');
                return;
            }

            // ELIMINAR
            if (transcript.includes('eliminar')) {
                currentCommand = 'eliminar';
                scene.emit('delete-mode');
                return;
            }

            // AYUDA
            if (transcript.includes('ayuda') || transcript.includes('help') || transcript.includes('comandos')) {
                currentCommand = 'help';
                updateUserMessage(`Estos son los\ncomandos disponibles:\n* CREAR\n* EDITAR\n* ELIMINAR\n* AYUDA\n* SALIR/ATRAS/CAMBIO\npara volver`, 'info');
                scene.emit('help-mode');
                return;
            }
        });
    }
});

AFRAME.registerComponent('delete-object', {
    schema: {
        input: { type: 'selector', default: null },
    },

    init: function () {
        const inputElement = this.data.input;
        const scene = document.querySelector('a-scene');
        let entityToDel = null; // Objeto a editar

        // Variables de estado FUERA del listener
        let deleteConfirmed = false;
        let deleteCancelled = false;
        let step = null;

        inputElement.addEventListener('transcription', (event) => {
            let transcript = event.detail.transcription.trim().toLowerCase().replace(/\.$/, '');

            if (!entityToDel) {
                if (transcript.includes('eliminar')) {
                    updateUserMessage('Por favor, dime el ID del objeto que quieres eliminar.', 'msg');
                    step = 'idDel';
                    return;
                }
                if (transcript.includes('crear') || transcript.includes('editar')) {
                    updateUserMessage('No puedes editar ni crear mientras estás en modo de eliminar.', 'warn');
                    return;
                }
                if (step === 'idDel') {
                    const torusElement = createTorus();
                    entityToDel = getEntityById(transcript);

                    if (entityToDel) {
                        entityToDel.appendChild(torusElement);
                        updateUserMessage(`¿Estás seguro que quieres eliminar ${entityToDel.id}? (Sí / No)`, 'msg');
                    } else if (transcript.includes('cambio')){
                        updateUserMessage('Accion finalizando...', 'msg');
                        // Mostrar otro mensaje después de 3 segundos
                        setTimeout(function () {
                            updateUserMessage("Reconocimiento de voz activado...",'msg');
                        }, 3000);  // 3000ms = 3 segundos                        
                    }else {
                        updateUserMessage('No se encontró un objeto con ese ID. ¿Intentamos de nuevo?', 'msg');
                        setTimeout(function () {
                            updateUserMessage("Reconocimiento de voz activado...",'msg');
                        }, 3000);  // 3000ms = 3 segundos   
                    }

                    step = null;
                    return;
                }
            } else {
                // Confirmación de eliminación
                if (!deleteConfirmed && !deleteCancelled) {
                    if (transcript.includes('sí')) {
                        deleteConfirmed = true;
                        updateUserMessage(`${entityToDel.id} eliminado`, 'msg');
                        
                        // Eliminar torus antes de borrar
                        const torusToRemove = entityToDel.querySelector('#edit');
                        if (torusToRemove) {
                            entityToDel.removeChild(torusToRemove);
                        }

                        entityToDel.parentNode.removeChild(entityToDel);

                        setTimeout(() => {
                            updateUserMessage("Diga 'salir', 'atrás' o 'cambio' para volver", 'msg');
                        }, 3000);
                        return;
                    } else if (transcript.includes('no')) {
                        deleteCancelled = true;
                        updateUserMessage("Eliminación cancelada. Diga 'salir', 'atrás' o 'cambio' para volver", 'msg');
                        return;
                    }
                }

                // Comandos para salir del modo
                const exitWords = ['salir', 'atrás', 'cambio'];
                if (exitWords.some(word => transcript.includes(word))) {
                    // Eliminar torus si queda
                    if (entityToDel) {
                        const torusToRemove = entityToDel.querySelector('#edit');
                        if (torusToRemove) {
                            entityToDel.removeChild(torusToRemove);
                        }
                        updateUserMessage(`Finalizando eliminación de ${entityToDel.id}`, 'msg');
                    }

                    entityToDel = null;
                    deleteConfirmed = false;
                    deleteCancelled = false;
                    step = null;

                    scene.emit('exit-create-mode');

                    setTimeout(() => {
                        updateUserMessage("Reconocimiento de voz activado...", 'msg');
                    }, 3000);
                }
            }
        });

    },
});

// Componente para crear objetos
AFRAME.registerComponent('object-creator', {
    init: function () {
        const scene = document.querySelector('a-scene');
        let currentObject = null; // Para almacenar referencia al objeto creado
        function createText(entity){
            const text = document.createElement('a-text');
            let objectHeight = entity.geometry.height || (entity.geometry.radius * 2) || 1; // fallback por si no hay info
            // Calcular posición del texto basado en altura del objeto
            const textY = objectHeight / 2 + 1; // 1 unidad por encima del tope
            text.setAttribute('value', entity.id);
            text.setAttribute('position', `0 ${textY} 0`);
            text.setAttribute('align', 'center');
            text.setAttribute('color', 'black');
            text.setAttribute('width', '10');
            text.setAttribute('look-at','[camera]')

            return text
        }
        // function createEntityFromData(data) {
        //     const entity = document.createElement('a-entity');
        // 
        //     if (data.id) entity.setAttribute('id', data.id);
        //     if (data.gltfModel) entity.setAttribute('gltf-model', data.gltfModel);
        // 
        //     if (data.position) {
        //         const pos = `${data.position.x} ${data.position.y} ${data.position.z}`;
        //         entity.setAttribute('position', pos);
        //     }
        // 
        //     if (data.rotation) {
        //         const rot = `${data.rotation.x} ${data.rotation.y} ${data.rotation.z}`;
        //         entity.setAttribute('rotation', rot);
        //     }
        // 
        //     if (data.scale) {
        //         const scl = `${data.scale.x} ${data.scale.y} ${data.scale.z}`;
        //         entity.setAttribute('scale', scl);
        //     }
        // 
        //     return entity;
        // }
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
                    material: { color: 'rgb(255, 166, 0)' }
                };

                // Crear cubo a partir de JSON
                const entity = document.createElement('a-entity');
                
                entity.setAttribute('id', cubeData.id);
                entity.setAttribute('geometry', `primitive: ${cubeData.geometry.primitive}; height: ${cubeData.geometry.height}; width: ${cubeData.geometry.width}; depth: ${cubeData.geometry.depth}`);
                entity.setAttribute('position', `${cubeData.position.x} ${cubeData.position.y} ${cubeData.position.z}`);
                entity.setAttribute('material', `color: ${cubeData.material.color}`);
                entity.setAttribute('class', 'dynamic-object'); // ID único para modificarlo después
                

                text = createText(cubeData)
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
        
                entity.setAttribute('id', sphereData.id);
                entity.setAttribute('geometry', `primitive: ${sphereData.geometry.primitive}; radius: ${sphereData.geometry.radius}`);
                entity.setAttribute('position', `${sphereData.position.x} ${sphereData.position.y} ${sphereData.position.z}`);
                entity.setAttribute('material', `color: ${sphereData.material.color}`);
                entity.setAttribute('class', 'dynamic-object');
                
                text = createText(sphereData)
                entity.appendChild(text);
                scene.appendChild(entity);
                
                console.log('Datos de la esfera:', JSON.stringify(sphereData, null, 2));
                
                // Guardar JSON en localStorage (opcional)
                localStorage.setItem('sphereData', JSON.stringify(sphereData));
                // detecta una palabra 
                modifyingSphere = true;
                currentObject = entity;
            }else if(objectType === 'plano'){
                const planeData = {
                    id: 'plano',
                    geometry: {
                        primitive: 'plane',
                        height: 15,
                        width: 15,
                        depth: 15
                    },
                    position: { x: 5, y: 5, z: -5 },
                    rotation: { x: 0, y: 0, z: 0 },
                    material: { color: 'rgb(121, 207, 64)' }
                };

                // Crear cubo a partir de JSON
                const entity = document.createElement('a-entity');
                
                entity.setAttribute('id', planeData.id);
                entity.setAttribute('geometry', `primitive: ${planeData.geometry.primitive}; height: ${planeData.geometry.height}; width: ${planeData.geometry.width}; depth: ${planeData.geometry.depth}`);
                entity.setAttribute('position', `${planeData.position.x} ${planeData.position.y} ${planeData.position.z}`);
                entity.setAttribute('rotation', `${planeData.rotation.x} ${planeData.rotation.y} ${planeData.rotation.z}`);
                entity.setAttribute('material', `color: ${planeData.material.color}`);
                entity.setAttribute('class', 'dynamic-object'); // ID único para modificarlo después
                

                text = createText(planeData)
                entity.appendChild(text);
                scene.appendChild(entity);
                
                console.log('Datos del plano:', JSON.stringify(planeData, null, 2));
                
                // Guardar JSON en localStorage (opcional)
                localStorage.setItem('planeData', JSON.stringify(planeData));
                // detecta una palabra 
                modifyingPlane = true;
                currentObject = entity;
            }else if (objectType === 'luz'){
                const lightData = {
                    id: 'luz',
                    light: {
                        type: 'point',
                        color: '#EF2D5E',
                        intensity: 0.5,
                        distance: 0,
                        decay: 1
                    },
                    position: { x: 0, y: 0, z: 0 },
                    rotation: { x: 0, y: 0, z: 0 },
                    geometry: {
                        primitive: 'sphere',
                        radius: 0.05
                    },
                    material: {
                        color: '#EF2D5E',
                        shader: 'flat'
                    }
                };
                
            
                
                // Crear entidad para representar visualmente la luz (como una esfera)
                const entity = document.createElement('a-entity');
                entity.setAttribute('id', lightData.id);
                entity.setAttribute('geometry', `primitive: ${lightData.geometry.primitive}; radius: ${lightData.geometry.radius}`);
                entity.setAttribute('material',  `color: red; wireframe: true`);
                entity.setAttribute('position', `${lightData.position.x} ${lightData.position.y} ${lightData.position.z}`);
                entity.setAttribute('rotation', `${lightData.rotation.x} ${lightData.rotation.y} ${lightData.rotation.z}`);
                entity.setAttribute('class', 'dynamic-object');
                
                
                // Crear la luz real
                const lightEntity = document.createElement('a-light');
                lightEntity.setAttribute('type', lightData.light.type);
                lightEntity.setAttribute('color', lightData.material.color);
                lightEntity.setAttribute('intensity', lightData.geometry.radius);
                lightEntity.setAttribute('distance', lightData.light.distance);
                lightEntity.setAttribute('decay', lightData.light.decay);
                lightEntity.setAttribute('position', `${lightData.position.x} ${lightData.position.y} ${lightData.position.z}`);
                
                // Agregar ambos al DOM
                text = createText(lightData)
                entity.appendChild(text);
                entity.appendChild(lightEntity);
                scene.appendChild(entity);
                
                
                console.log('Datos de la luz:', JSON.stringify(lightData, null, 2));
                
                // Guardar JSON en localStorage (opcional)
                localStorage.setItem('lightData', JSON.stringify(lightData));
                // detecta una palabra 
                modifyingLight = true;
                currentObject = entity;
            }else if(objectType === 'contenedor'){
                const assetData = {
                    id: 'contenedor',
                    gltfModel: '#contenedor',
                    position: { x: -4, y: 1, z: -3 },
                    geometry: {height:1},
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: 0.025, y: 0.025, z: 0.025 }
                };

                // Crear cubo a partir de JSON
                const entity = document.createElement('a-entity');
                
                entity.setAttribute('id', assetData.id);
                entity.setAttribute('gltf-model',assetData.gltfModel);
                entity.setAttribute('position', `${assetData.position.x} ${assetData.position.y} ${assetData.position.z}`);
                entity.setAttribute('scale', `${assetData.scale.x} ${assetData.scale.y} ${assetData.scale.z}`);
                entity.setAttribute('class', 'dynamic-object'); // ID único para modificarlo después
                

                text = createText(assetData)
                text.setAttribute('scale','40 40 40')
                text.setAttribute('position','0 86 0')
                entity.appendChild(text);
                scene.appendChild(entity);
                
                console.log('Datos del asset:', JSON.stringify(assetData, null, 2));
                
                // Guardar JSON en localStorage (opcional)
                localStorage.setItem('assetData', JSON.stringify(assetData));
                // detecta una palabra 
                modifyingConteiner = true;
                currentObject = entity;
            }
            else {
                console.log(`Tipo de objeto no soportado: ${objectType}`);
            }
        });
    },
});

// Componente de comandos dinámicos para CREAR atributos
AFRAME.registerComponent('dynamic-modifier', {
    schema: {
      input: { type: 'selector', default: null },
    },
  
    init: function () {
      const inputElement = this.data.input;
      const scene = document.querySelector('a-scene');
      
      if (!inputElement) {
        console.error('No se ha especificado un elemento de entrada para dynamic-modifier');
        return;
      }

      // Manejar la transcripción
      inputElement.addEventListener('transcription', (event) => {
        const transcript = event.detail.transcription.toLowerCase();

        let entity = getLastCreatedEntity();
  
        if (!entity) return; // No hay entidad para modificar
  
        // Función que maneja el proceso de modificación
        function handleModification(modifyingFlag, objectType) {
          if (!modifyingFlag) return;
  
          updateUserMessage('¿Qué valores quieres modificar?','msg');
          updateUserMessage('Posición\nRotación\nTamaño\nColor\nID', 'info');
  
          if (step) {
            console.log('entidad: ',entity)
            const stepActions = {
              'x': () => stepsPOS('x', entity, transcript),
              'y': () => stepsPOS('y', entity, transcript),
              'z': () => stepsPOS('z', entity, transcript),
              'x-rot': () => stepsROT('x', entity, transcript),
              'y-rot': () => stepsROT('y', entity, transcript),
              'z-rot': () => stepsROT('z', entity, transcript),
              'size': () => stepSIZE(entity, transcript),
              'color': () => stepCOLOR(entity, transcript),
              'id': () => stepID(entity, transcript),
            };
  
            if (stepActions[step]) {
              stepActions[step]();
            }
            return;
          }

          // Detección de palabras clave
          const keywordActions = {
            'posición': { step: 'x', message: '¿Qué valor para POS en X?' },
            'rotación': { step: 'x-rot', message: '¿Qué valor para ROT en X?' },
            'tamaño': { step: 'size', message: '¿Qué tamaño?' },
            'color': { step: 'color', message: '¿Qué color?' },
            'id': { step: 'id', message: '¿Qué ID?' },
            'cambio': { exit: true },  // Salir del modo de modificación pero permitir crear nuevo objeto
          };
  
            for (const keyword in keywordActions) {
                if (transcript.includes(keyword)) {
                    if (keywordActions[keyword].exit) {
                        console.log('Saliendo del modo modificación');
                        modifyingBox = false;
                        modifyingSphere = false;
                        modifyingCylinder = false;
                        modifyingPlane = false;
                        modifyingLight = false;
                        modifyingConteiner = false;
                        modifyingRadio = false;
                        updateUserMessage(`Se ha terminado de modificar el ${objectType}`,'msg');
                        updateUserMessage('...', 'info');
                        scene.emit('exit-create-mode');
                                        // Mostrar otro mensaje después de 3 segundos
                        setTimeout(function() {
                            updateUserMessage("Reconociemiento de voz activado ...",'msg');
                        }, 3000);  // 3000ms = 3 segundos
                    } else {
                        step = keywordActions[keyword].step;
                        updateUserMessage(keywordActions[keyword].message,'msg');
                    }
                    return;
                }
            }
        }
  
        // Llamada a `handleModification` para cada tipo de objeto en modificación
        const objectsInModification = [
          { modifyingFlag: modifyingBox, objectType: 'Cubo' },
          { modifyingFlag: modifyingSphere, objectType: 'Esfera' },
          { modifyingFlag: modifyingCylinder, objectType: 'Cilindro' },
          { modifyingFlag: modifyingPlane, objectType: 'Plano' },
          { modifyingFlag: modifyingLight, objectType: 'Luz' },
          { modifyingFlag: modifyingConteiner, objectType: 'Contenedor' },
          { modifyingFlag: modifyingRadio, objectType: 'Radio' },
        ];
  
        // Ejecuta la modificación para cada objeto
        objectsInModification.forEach(obj => handleModification(obj.modifyingFlag, obj.objectType));
        
        // Cuando termina el proceso de "cambio", se habilita la creación de nuevos objetos
        if (modifyingBox === false && modifyingSphere === false && modifyingCylinder === false && modifyingPlane === false) {
          scene.emit('start-create-mode');
        }
      });
    },
});

// Componente de comandos dinámicos para EDITAR atributos
AFRAME.registerComponent('edit-mode-handler', {
    schema: {
        input: { type: 'selector', default: null },
    },

    init: function () {
        const inputElement = this.data.input;
        const scene = document.querySelector('a-scene');
        let entityToEdit = null; // Objeto a editar

        // Escuchar eventos de transcripción para editar el objeto
        inputElement.addEventListener('transcription', (event) => {
            const transcript = event.detail.transcription.trim().toLowerCase().replace(/\.$/, '');

            if (!entityToEdit) {
                // Pedir el ID del objeto a editar
                if (transcript.includes('editar')) {
                    updateUserMessage('Por favor, dime el ID del objeto que quieres editar.','msg');
                    step = 'idEdit'; // Indicar que vamos a capturar el ID
                    return;
                }

                // Buscar el objeto por ID
                if (step === 'idEdit') {
                    // Crear el torus
                    const torusElement = createTorus();

                    // Buscar el objeto por ID
                    entityToEdit = getEntityById(transcript);
                    
                    if (entityToEdit) {
                        // Añadir el torus al objeto para su edición
                        entityToEdit.appendChild(torusElement);
                        updateUserMessage(`Editando el objeto ${entityToEdit.id}. ¿Qué valores quieres modificar?`,'msg');
                        updateUserMessage('Posición\nRotación\nTamaño\nColor\nID', 'info');
                    } else {
                        updateUserMessage('No se encontró un objeto con ese ID. ¿Intentamos de nuevo?','msg');
                        setTimeout(function () {
                            updateUserMessage("Reconocimiento de voz activado...",'msg');
                        }, 3000);  // 3000ms = 3 segundos   
                    }

                    // Resetear paso después de encontrar el objeto
                    step = null;
                }
            } else {
                // Procesar los cambios según el paso
                if (step) {
                    const stepActions = {
                        'x': () => stepsPOS('x', entityToEdit, transcript),
                        'y': () => stepsPOS('y', entityToEdit, transcript),
                        'z': () => stepsPOS('z', entityToEdit, transcript),
                        'x-rot': () => stepsROT('x', entityToEdit, transcript),
                        'y-rot': () => stepsROT('y', entityToEdit, transcript),
                        'z-rot': () => stepsROT('z', entityToEdit, transcript),
                        'size': () => stepSIZE(entityToEdit, transcript),
                        'color': () => stepCOLOR(entityToEdit, transcript),
                        'id': () => stepID(entityToEdit, transcript),
                    };

                    if (stepActions[step]) {
                        stepActions[step]();
                    }
                    return;
                }

                // Detección de palabras clave
                const keywordActions = {
                    'posición': { step: 'x', message: '¿Qué valor para POS en X?' },
                    'rotación': { step: 'x-rot', message: '¿Qué valor para ROT en X?' },
                    'tamaño': { step: 'size', message: '¿Qué tamaño?' },
                    'color': { step: 'color', message: '¿Qué color?' },
                    'id': { step: 'id', message: '¿Qué ID?' },
                    'cambio': { exit: true },  // Salir del modo de modificación
                };

                for (const keyword in keywordActions) {
                    if (transcript.includes(keyword)) {
                        if (keywordActions[keyword].exit) {
                            // Eliminar el torus cuando se sale del modo de edición
                            if (entityToEdit) {
                                const torusToRemove = entityToEdit.querySelector('#edit');
                                if (torusToRemove) {
                                    entityToEdit.removeChild(torusToRemove);
                                }
                            }
                            
                            console.log('Saliendo del modo modificación');
                            updateUserMessage(`Se ha terminado de editar el objeto: ${entityToEdit ? entityToEdit.id : 'desconocido'}`,'msg');
                            scene.emit('exit-create-mode');

                            // Limpiar estado
                            entityToEdit = null;
                            step = null;

                            // Mostrar otro mensaje después de 3 segundos
                            setTimeout(function () {
                                updateUserMessage("Reconocimiento de voz activado...",'msg');
                            }, 3000);  // 3000ms = 3 segundos
                        } else {
                            step = keywordActions[keyword].step;
                            updateUserMessage(keywordActions[keyword].message,'msg');
                        }
                        return;
                    }
                }
            }
        });
    },
});

// Componente para modificar FONDOS
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
            this.updateSky('create');
        });
        scene.addEventListener('edit-mode', () => {
            this.updateSky('edit');
        });
        scene.addEventListener('help-mode', () => {
            this.updateSky('help');
        });
        scene.addEventListener('delete-mode', () => {
            this.updateSky('delete');
        });
        scene.addEventListener('exit-create-mode', () => {
            this.updateSky(false);
        });
    },

    updateSky: function (isCreateMode) {
        const el = this.el;
        if (isCreateMode === 'create') {
            el.setAttribute('material', 'color: rgb(201, 224, 158)'); // Verde claro
            console.log('Modo creación activado: color de fondo cambiado.');
        } else if (isCreateMode === 'edit') {
            el.setAttribute('material', 'color: rgb(151, 222, 231)'); // Verde claro
            console.log('Modo edicion activado: color de fondo cambiado.');
        }else if (isCreateMode === 'help') {
            el.setAttribute('material', 'color: rgb(250, 201, 252)'); // Verde claro
            console.log('Modo ayuda activado: color de fondo cambiado.');
        }else if (isCreateMode === 'delete') {
            el.setAttribute('material', 'color: rgb(131, 26, 26)'); // Verde claro
            console.log('Modo eliminar activado: color de fondo cambiado.');
        }else {
            el.setAttribute('material', 'color: rgb(196, 196, 196)'); // Color neutro
            console.log('color de fondo restaurado.');
        }
    }
});
