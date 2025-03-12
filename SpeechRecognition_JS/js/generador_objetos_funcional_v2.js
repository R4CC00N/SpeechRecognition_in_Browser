// Función para actualizar el mensaje del usuario
function updateUserMessage(message) {
    const messageElement = document.querySelector('#userMessage');
    if (messageElement) {
        messageElement.setAttribute('value', message);
    }
}
    
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
            const components = ['cubo', 'esfera', 'plano', 'cilindro','luz'];
            const assets = ['pistola1','pistola2']
            let currentCommand = null;
    
            if (!inputElement) {
                console.error('No se ha especificado un elemento de entrada para command-handler');
                return;
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
                    updateUserMessage('Dime qué objeto crear (cubo, esfera, plano, cilindro, luz, assets)');
                    scene.emit('enter-create-mode');
                } else if (currentCommand === 'crear' && components.some((comp) => transcript.includes(comp))) {
                    const objectType = components.find((comp) => transcript.includes(comp));
                    updateUserMessage(`Creando un ${objectType}.`);
                    currentCommand = null; // Resetear el comando
                    // Emitir un evento para iniciar la creación en object-creator
                    scene.emit('start-object-creation', { type: objectType });
                } 
                else if (currentCommand === 'crear' && transcript.includes('assets')) {
                    currentCommand = assets
                    updateUserMessage(`¿Que asset quieres? ${assets}.`);                    
                }
                else if (transcript.includes('salir')) {
                    currentCommand = 'fin';
                    updateUserMessage('Terminando creación');
                    scene.emit('exit-create-mode');
                } else if (transcript.includes('editar')) {
                    currentCommand = 'editar';
                    updateUserMessage('Editando.');
                    scene.emit('edit-mode');
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
                    material: { color: 'rgb(255, 166, 0)' }
                };

                
                let objectHeight = cubeData.geometry.height || (cubeData.geometry.radius * 2) || 1; // fallback por si no hay info
                // Calcular posición del texto basado en altura del objeto
                const textY = objectHeight / 2 + 1; // 1 unidad por encima del tope
                // Crear cubo a partir de JSON
                const entity = document.createElement('a-entity');
                const text = document.createElement('a-text');
                entity.setAttribute('id', cubeData.id);
                entity.setAttribute('geometry', `primitive: ${cubeData.geometry.primitive}; height: ${cubeData.geometry.height}; width: ${cubeData.geometry.width}; depth: ${cubeData.geometry.depth}`);
                entity.setAttribute('position', `${cubeData.position.x} ${cubeData.position.y} ${cubeData.position.z}`);
                entity.setAttribute('material', `color: ${cubeData.material.color}`);
                entity.setAttribute('class', 'dynamic-object'); // ID único para modificarlo después
                

                text.setAttribute('value', cubeData.id);
                text.setAttribute('position', `0 ${textY} 0`); // Ajustar la posición para que se vea
                text.setAttribute('align', 'center');
                text.setAttribute('color', 'black');
                text.setAttribute('width', '10');

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


                let objectHeight = sphereData.geometry.height || (sphereData.geometry.radius * 2) || 1; // fallback por si no hay info
                // Calcular posición del texto basado en altura del objeto
                const textY = objectHeight / 2 + 1; // 1 unidad por encima del tope

                // Crear esfera a partir de JSON
                const entity = document.createElement('a-entity');
                const text = document.createElement('a-text');
                entity.setAttribute('id', sphereData.id);
                entity.setAttribute('geometry', `primitive: ${sphereData.geometry.primitive}; radius: ${sphereData.geometry.radius}`);
                entity.setAttribute('position', `${sphereData.position.x} ${sphereData.position.y} ${sphereData.position.z}`);
                entity.setAttribute('material', `color: ${sphereData.material.color}`);
                entity.setAttribute('class', 'dynamic-object');
                
                text.setAttribute('value', sphereData.id);
                text.setAttribute('position', `0 ${textY} 0`); // Ajustar la posición para que se vea
                text.setAttribute('align', 'center');
                text.setAttribute('color', 'black');
                text.setAttribute('width', '10');

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

                // Asumimos que lightData.geometry tiene una propiedad "height" o "radius"
                let objectHeight = planeData.geometry.height || (planeData.geometry.radius * 2) || 1; // fallback por si no hay info
                // Calcular posición del texto basado en altura del objeto
                const textY = objectHeight / 2 + 1; // 1 unidad por encima del tope
                // Crear cubo a partir de JSON
                const entity = document.createElement('a-entity');
                const text = document.createElement('a-text');
                entity.setAttribute('id', planeData.id);
                entity.setAttribute('geometry', `primitive: ${planeData.geometry.primitive}; height: ${planeData.geometry.height}; width: ${planeData.geometry.width}; depth: ${planeData.geometry.depth}`);
                entity.setAttribute('position', `${planeData.position.x} ${planeData.position.y} ${planeData.position.z}`);
                entity.setAttribute('rotation', `${planeData.rotation.x} ${planeData.rotation.y} ${planeData.rotation.z}`);
                entity.setAttribute('material', `color: ${planeData.material.color}`);
                entity.setAttribute('class', 'dynamic-object'); // ID único para modificarlo después
                

                text.setAttribute('value', planeData.id);
                text.setAttribute('position', `0 ${textY} 0`); // Ajustar la posición para que se vea
                text.setAttribute('align', 'center');
                text.setAttribute('color', 'black');
                text.setAttribute('width', '10');

                entity.appendChild(text);
                scene.appendChild(entity);
                
                console.log('Datos del cubo:', JSON.stringify(planeData, null, 2));
                
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
                    position: { x: 2, y: 0, z: -3 },
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
                
                // Fallback para altura del objeto
                let objectHeight = lightData.geometry.height || (lightData.geometry.radius * 2) || 1;
                
                // Crear entidad para representar visualmente la luz (como una esfera)
                const entity = document.createElement('a-entity');
                entity.setAttribute('id', lightData.id);
                entity.setAttribute('geometry', `primitive: ${lightData.geometry.primitive}; radius: ${lightData.geometry.radius}`);
                entity.setAttribute('material',  `color: red; wireframe: true`);
                entity.setAttribute('position', `${lightData.position.x} ${lightData.position.y} ${lightData.position.z}`);
                entity.setAttribute('rotation', `${lightData.rotation.x} ${lightData.rotation.y} ${lightData.rotation.z}`);
                entity.setAttribute('class', 'dynamic-object');
                
                // Crear el texto
                const text = document.createElement('a-text');
                const textY = objectHeight / 2 + 1; // 1 unidad arriba
                text.setAttribute('value', lightData.id);
                text.setAttribute('position', `0 ${textY} 0`);
                text.setAttribute('align', 'center');
                text.setAttribute('color', 'black');
                text.setAttribute('width', '10');
                entity.appendChild(text);
                
                // Crear la luz real
                const lightEntity = document.createElement('a-light');
                lightEntity.setAttribute('type', lightData.light.type);
                lightEntity.setAttribute('color', lightData.material.color);
                lightEntity.setAttribute('intensity', lightData.geometry.radius);
                lightEntity.setAttribute('distance', lightData.light.distance);
                lightEntity.setAttribute('decay', lightData.light.decay);
                lightEntity.setAttribute('position', `${lightData.position.x} ${lightData.position.y} ${lightData.position.z}`);
                
                // Agregar ambos al DOM
                entity.appendChild(lightEntity);
                scene.appendChild(entity);
                
                
                
                console.log('Datos del cubo:', JSON.stringify(lightData, null, 2));
                
                // Guardar JSON en localStorage (opcional)
                localStorage.setItem('lightData', JSON.stringify(lightData));
                // detecta una palabra 
                modifyingLight = true;
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
let modifyingCylinder = false;
let modifyingLight = false;
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
  


// Componente de comandos dinámicos para modificar atributos
AFRAME.registerComponent('dynamic-modifier', {
    schema: {
      input: { type: 'selector', default: null },
    },
  
    init: function () {
      const inputElement = this.data.input;
      const scene = document.querySelector('a-scene');

      // Obtener la última entidad creada
      function getLastCreatedEntity() {
        const entities = document.querySelectorAll('a-entity');
        if (entities.length > 0) {
          return entities[entities.length - 1]; // Devuelve el último creado
        }
        return null; // Si no hay entidades, retorna null
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
            updateUserMessage(step ? `¿Qué valor en POS ${step}?` : 'Posición completa. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
            } else {
            updateUserMessage(`Por favor, dime un número para POS ${posKey}.`);
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
            updateUserMessage(step ? `¿Qué valor en ${step}?` : 'Rotación completa. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
        } else {
            updateUserMessage(`Por favor, dime un número para ROT ${posKey}.`);
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
                updateUserMessage('Color modificado. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
            } else {
                updateUserMessage('Por favor, dime un color válido para el objeto.');
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
            updateUserMessage('ID modificado. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
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
            updateUserMessage('Tamaño modificado. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
            } else {
            updateUserMessage('Por favor, dime un tamaño para el objeto.');
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
  
          updateUserMessage('¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
  
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
                        updateUserMessage(`Se ha terminado de modificar el ${objectType}`);
                        scene.emit('exit-create-mode');
                                        // Mostrar otro mensaje después de 3 segundos
                        setTimeout(function() {
                            updateUserMessage("Reconociemiento de voz activado ...");
                        }, 3000);  // 3000ms = 3 segundos
                    } else {
                        step = keywordActions[keyword].step;
                        updateUserMessage(keywordActions[keyword].message);
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

AFRAME.registerComponent('edit-mode-handler', {
    schema: {
        input: { type: 'selector', default: null },
    },

    init: function () {
        const inputElement = this.data.input;
        const scene = document.querySelector('a-scene');
        let entityToEdit = null; // Objeto a editar
        let step = null; // Paso actual en la edición

        // Obtener objeto por ID
        function getEntityById(id) {
            return document.querySelector(`#${id}`);
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
            updateUserMessage(step ? `¿Qué valor en POS ${step}?` : 'Posición completa. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
            } else {
            updateUserMessage(`Por favor, dime un número para POS ${posKey}.`);
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
            updateUserMessage(step ? `¿Qué valor en ${step}?` : 'Rotación completa. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
        } else {
            updateUserMessage(`Por favor, dime un número para ROT ${posKey}.`);
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
                updateUserMessage('Color modificado. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
            } else {
                updateUserMessage('Por favor, dime un color válido para el objeto.');
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
            updateUserMessage('ID modificado. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
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
            updateUserMessage('Tamaño modificado. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)');
            } else {
            updateUserMessage('Por favor, dime un tamaño para el objeto.');
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

        // Escuchar eventos de transcripción para editar el objeto
        inputElement.addEventListener('transcription', (event) => {
            const transcript = event.detail.transcription.trim().toLowerCase().replace(/\.$/, '');

            if (!entityToEdit) {
                // Pedir el ID del objeto a editar
                if (transcript.includes('editar')) {
                    updateUserMessage('Por favor, dime el ID del objeto que quieres editar.');
                    step = 'id'; // Indicar que vamos a capturar el ID
                    return;
                }

                // Buscar el objeto por ID
                if (step === 'id') {
                    // Crear el torus
                    const torusElement = createTorus();

                    // Buscar el objeto por ID
                    entityToEdit = getEntityById(transcript);
                    
                    if (entityToEdit) {
                        // Añadir el torus al objeto para su edición
                        entityToEdit.appendChild(torusElement);
                        updateUserMessage(`Editando el objeto ${entityToEdit.id}. ¿Qué valores quieres modificar? (Posición, Rotación, Tamaño, Color, ID)`);
                    } else {
                        updateUserMessage('No se encontró un objeto con ese ID. ¿Intentamos de nuevo?');
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
                            updateUserMessage(`Se ha terminado de editar el objeto: ${entityToEdit ? entityToEdit.id : 'desconocido'}`);
                            scene.emit('exit-create-mode');

                            // Limpiar estado
                            entityToEdit = null;
                            step = null;

                            // Mostrar otro mensaje después de 3 segundos
                            setTimeout(function () {
                                updateUserMessage("Reconocimiento de voz activado...");
                            }, 3000);  // 3000ms = 3 segundos
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
            this.updateSky('create');
        });
        scene.addEventListener('edit-mode', () => {
            this.updateSky('edit');
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
            console.log('Modo creación activado: color de fondo cambiado.');
        }
         else {
            el.setAttribute('material', 'color: rgb(196, 196, 196)'); // Color neutro
            console.log('Modo creación desactivado: color de fondo restaurado.');
        }
    }
});