// Componente de la camara,InputBox y controladores VR
AFRAME.registerComponent('player-move', {
    init: function () {
        const voiceInputBox = document.createElement('a-box');
        voiceInputBox.setAttribute('id', 'voiceInputBox');
        voiceInputBox.setAttribute('position', '0 -2 -3');
        voiceInputBox.setAttribute('rotation', '-38 0 0');
        voiceInputBox.setAttribute('depth', '0.15');
        voiceInputBox.setAttribute('height', '0.25');
        voiceInputBox.setAttribute('width', '2');
        voiceInputBox.setAttribute('color', '#8ec3d0');
        voiceInputBox.setAttribute('animation', 'startEvents: click; property: scale; from: 2 2 2; to: 1 1 1; dur: 1000');
        voiceInputBox.setAttribute('input-text', 'event: click');  // Componente personalizado (si lo tienes)
        voiceInputBox.setAttribute('look-at', '#camera');

        // Crear el texto de la caja de entrada de voz
        const voiceText = document.createElement('a-text');
        voiceText.setAttribute('value', 'Pulsa para grabar/detener');
        voiceText.setAttribute('align', 'center');
        voiceText.setAttribute('position', '0 0 0.1');
        voiceText.setAttribute('color', 'black');
        voiceText.setAttribute('width', '3');
        voiceInputBox.appendChild(voiceText);
        
        // Crear el jugador con controles de movimiento
        const player = document.createElement('a-entity');
        player.setAttribute('id', 'player');
        player.setAttribute('movement-controls', 'fly: false');
        player.setAttribute('position', '0 2 -1');

        // Crear el rig de la camara
        const cameraRig = document.createElement('a-entity');
        cameraRig.setAttribute('camera', '');
        cameraRig.setAttribute('position', '0 2 4');
        cameraRig.setAttribute('look-controls', '');  // Permite que la camara siga el movimiento de la cabeza
        cameraRig.setAttribute('wasd-controls', '');  // Habilita los controles WASD para el movimiento

        // Crear el texto de ayuda
        const helpText = document.createElement('a-text');
        helpText.setAttribute('value', 'Say Help for commands');
        helpText.setAttribute('position', '0.8 -0.65 -1');
        helpText.setAttribute('color', 'black');
        helpText.setAttribute('width', '1');
        cameraRig.appendChild(helpText);

        // Añadir la caja de voz al rig de la camara
        cameraRig.appendChild(voiceInputBox);

        // Añadir el rig de la camara al jugador
        player.appendChild(cameraRig);

        // Crear el cursor del ratón (interactividad)
        const mouseCursor = document.createElement('a-entity');
        mouseCursor.setAttribute('cursor', 'rayOrigin: mouse');
        player.appendChild(mouseCursor);

        // Crear el controlador de la mano derecha
        const rightHand = document.createElement('a-entity');
        rightHand.setAttribute('laser-controls', 'hand: right');
        rightHand.setAttribute('cursor', 'fuse: true; rayOrigin: controller');
        player.appendChild(rightHand);

        // Finalmente, añadir el jugador a la escena
        this.el.appendChild(player);


    }
});

// Componente del panel con informacion de comandos
AFRAME.registerComponent('info-panel', {
    init: function () {
        const infoPanel = document.createElement('a-plane');
        infoPanel.setAttribute('position', '25 15 -45');
        infoPanel.setAttribute('width', '13');
        infoPanel.setAttribute('height', '13');
        infoPanel.setAttribute('color', 'black');
        infoPanel.setAttribute('look-at', '[camera]');
        infoPanel.setAttribute('sky-manager', '');

        const infoInner = document.createElement('a-plane');
        infoInner.setAttribute('position', '0 0 0.3');
        infoInner.setAttribute('width', '12');
        infoInner.setAttribute('height', '12');
        infoInner.setAttribute('color', 'white');

        const infoTitle = document.createElement('a-text');
        infoTitle.setAttribute('value', 'INFORMATION');
        infoTitle.setAttribute('align', 'center');
        infoTitle.setAttribute('color', 'black');
        infoTitle.setAttribute('position', '0 8 0');
        infoTitle.setAttribute('width', '25');

        const typeMessage = document.createElement('a-text');
        typeMessage.setAttribute('id', 'typeMessage');
        typeMessage.setAttribute('value', '...');
        typeMessage.setAttribute('align', 'center');
        typeMessage.setAttribute('color', 'black');
        typeMessage.setAttribute('position', '0 0 0.1');
        typeMessage.setAttribute('width', '20');

        infoInner.appendChild(infoTitle);
        infoInner.appendChild(typeMessage);
        infoPanel.appendChild(infoInner);

        this.el.appendChild(infoPanel);
    }
});

// Componente del Mensaje de informacion
AFRAME.registerComponent('text-message', {
    init: function () {
        const userMessage = document.createElement('a-text');
        userMessage.setAttribute('id', 'userMessage');
        userMessage.setAttribute('value', 'Bienvenido a VOICE VR');
        userMessage.setAttribute('align', 'center');
        userMessage.setAttribute('color', 'black');
        userMessage.setAttribute('position', '0 20 -45');
        userMessage.setAttribute('width', '25');
        userMessage.setAttribute('look-at', '[camera]');
        this.el.appendChild(userMessage);
    }
});

// Componente del Panel de Transcripción
AFRAME.registerComponent('transcript-panel', {
    init: function () {
        const transPanel = document.createElement('a-plane');
        transPanel.setAttribute('position', '0 15 -45');
        transPanel.setAttribute('width', '17');
        transPanel.setAttribute('height', '7');
        transPanel.setAttribute('color', 'black');
        transPanel.setAttribute('look-at', '[camera]');
        transPanel.setAttribute('sky-manager', '');

        const transInner = document.createElement('a-plane');
        transInner.setAttribute('position', '0 0 0.3');
        transInner.setAttribute('width', '16');
        transInner.setAttribute('height', '6');
        transInner.setAttribute('color', 'white');
        transInner.setAttribute('transcription-display', 'input: #voiceInputBox');

        const transText = document.createElement('a-text');
        transText.setAttribute('id', 'transcriptionText');
        transText.setAttribute('value', '...');
        transText.setAttribute('align', 'center');
        transText.setAttribute('color', 'black');
        transText.setAttribute('position', '0 0 0.1');
        transText.setAttribute('width', '25');
        transText.setAttribute('font', '');

        transInner.appendChild(transText);
        transPanel.appendChild(transInner);
        this.el.appendChild(transPanel);

    }
});

// Componente del InputBox
AFRAME.registerComponent('hud-component', {
    init: function () {
        const voiceInputBox = document.createElement('a-box');
        voiceInputBox.setAttribute('id', 'voiceInputBox');
        voiceInputBox.setAttribute('position', '0 -2 -3');
        voiceInputBox.setAttribute('depth', '0.15');
        voiceInputBox.setAttribute('height', '0.25');
        voiceInputBox.setAttribute('width', '2');
        voiceInputBox.setAttribute('color', '#8ec3d0');
        voiceInputBox.setAttribute('animation', 'startEvents: click; property: scale; from: 2 2 2; to: 1 1 1; dur: 1000');
        voiceInputBox.setAttribute('input-text', 'event: click');
        voiceInputBox.setAttribute('look-at', '#camera');

        const voiceText = document.createElement('a-text');
        voiceText.setAttribute('value', 'Pulsa para grabar/detener');
        voiceText.setAttribute('align', 'center');
        voiceText.setAttribute('position', '0 0 0.1');
        voiceText.setAttribute('color', 'black');
        voiceText.setAttribute('width', '3');
        voiceInputBox.appendChild(voiceText);

        const helpText = document.createElement('a-text');
        helpText.setAttribute('value', 'Say Help for commands');
        helpText.setAttribute('position', '0.8 -0.65 -1');
        helpText.setAttribute('color', 'black');
        helpText.setAttribute('width', '1');

        // Agregar todos los elementos al entity que tiene el componente
        this.el.appendChild(voiceInputBox);
        this.el.appendChild(helpText);
    }
});



// ------------------------- FUNCIONES -------------------------------

// COMPONENTE DE FUNCIONES 
// 
// CUANDO UN COMPONENTE QUIERA ACTUALIZAR LLAMAMOS A LA FUNCION DEL COMPONENTE.

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

//
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
    updateUserMessage(step ? `¿Que valor en POS ${step}?` : 'Posicion completa. ¿Que valores quieres modificar?','msg');
    updateUserMessage('Posicion\nRotacion\nTamaño\nColor\nID', 'info');
    } else {
    updateUserMessage(`Por favor, dime un numero para POS ${posKey}.`,'msg');
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
        updateUserMessage(step ? `¿Que valor en ${step}?` : 'Rotación completa. ¿Que valores quieres modificar?','msg');
        updateUserMessage('Posicion\nRotacion\nTamaño\nColor\nID', 'info');
    } else {
        updateUserMessage(`Por favor, dime un numero para ROT ${posKey}.`,'msg');
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
      
          // Si tiene luz, cambiar tambien el color de la luz
          if (entityChild) {
              entityChild.setAttribute('light', 'color', colorsMap[matchedColor]);
          }
      
          step = null;
          updateUserMessage('Color modificado. ¿Que valores quieres modificar?','msg');
          updateUserMessage('Posicion\nRotacion\nTamaño\nColor\nID', 'info');
      } else {
          updateUserMessage('Por favor, dime un color valido para el objeto.','msg');
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
    updateUserMessage('ID modificado. ¿Que valores quieres modificar?','msg');
    updateUserMessage('Posicion\nRotacion\nTamaño\nColor\nID', 'info');
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
        updateUserMessage('Tamaño modificado. ¿Que valores quieres modificar?','msg');
        updateUserMessage('Posicion\nRotacion\nTamaño\nColor\nID', 'info');
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
                const textY = objectHeight + 0.5;// Colocamos el texto justo encima, 0.5 unidades mas arriba
                console.log('child posY: ', textY);
                console.log('objectHeight: ', objectHeight);
    
                // Establecer la nueva posición del texto
                entityChild.setAttribute('position', `0 ${textY} 0`);
            }
            // Si es un cilindro o torus, usamos la altura
            else if (entity.components.geometry.oldData.height) {
                objectHeight = entity.components.geometry.oldData.height;
                                // Calcular la posición Y para el texto (1 unidad por encima del tope)
                const textY = objectHeight/2 + 1;// Colocamos el texto justo encima, 0.5 unidades mas arriba
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

// Obtener la ultima entidad creada
function getLastCreatedEntity() {
    const objectCreated = document.querySelector('#objsCreated');
    
    if (!objectCreated) {
        console.warn('El elemento #objsCreated no existe aun. Esperando a que se cree...');
        // Aquí podrías añadir lógica para esperar y reintentar despues de un tiempo
        setTimeout(getLastCreatedEntity, 1000);  // Reintentar despues de 1 segundo
        return null;
    }

    const entities = objectCreated.querySelectorAll('a-entity');
    
    if (entities.length > 0) {
        return entities[entities.length - 1];  // Devuelve el último creado
    }
    
    return null;  // Si no hay entidades, retorna null
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

    // Crear el cilindro en la posición del torus con los mismos parametros
    const cylinderElement = document.createElement('a-cylinder');
    cylinderElement.setAttribute('position', '0 0.5 0'); // Mismo centro que el torus
    cylinderElement.setAttribute('height', '10');  // Altura del cilindro
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
    'marron': 'brown',
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
    'cafecito': 'marron',
    'cafe': 'marron',
    'celeste': 'azul', // o un color aparte si queres

    // Ingles directo
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
    'brown': 'marron',
};

//-------------------------------------------------------------

//--------------- COMPONENTES ---------------------------------


// Componente de reconocimiento de voz
AFRAME.registerComponent('input-text', {
  schema: {
    message: { type: 'string', default: 'comienza la grabacion!' },
    event: { type: 'string', default: '' },
  },

  init: function () {
    var el = this.el;
    var recognition;
    var isRecording = false;

    // 🔤 Quitar acentos
    function quitarAcentos(texto) {
    // Reemplaza solo vocales acentuadas comunes, sin tocar la ñ
    const acentos = {
        'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
        'Á': 'A', 'É': 'E', 'Í': 'I', 'Ó': 'O', 'Ú': 'U'
    };
    return texto.replace(/[áéíóúÁÉÍÓÚ]/g, letra => acentos[letra]);
    }

    // 🔢 Convertir texto a numero
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

    // 🎤 Inicializar reconocimiento de voz
    if ('webkitSpeechRecognition' in window) {
      recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = 'es-ES';
    } else {
      console.error('API de reconocimiento de voz no soportada en este navegador');
    }

    // 🎬 Click para iniciar/detener
    el.addEventListener('click', () => {
      if (!isRecording) {
        if (recognition) {
          recognition.start();
          isRecording = true;
          updateUserMessage('Reconocimiento de voz iniciado...', 'msg');
        }
      } else {
        if (recognition) {
          recognition.stop();
          isRecording = false;
          updateUserMessage('Reconocimiento de voz detenido.', 'msg');
        }
      }
    });

    // 📥 Resultado del reconocimiento
    if (recognition) {
      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        // Procesamiento de la transcripcion
        transcript = transcript.toLowerCase();
        transcript = quitarAcentos(transcript);
        transcript = convertirTextoANumero(transcript);

        // Emitir el texto limpio
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
                // Si no es salir/atras, ignorar nuevos comandos
                if (!transcript.includes('salir') && !transcript.includes('atras') && !transcript.includes('cambio')) {
                    console.log(`Comando ignorado. Ya hay uno activo: ${currentCommand}`);
                    return;
                }
            }
            // SALIR o ATRaS — cancelar cualquier modo activo
            if (transcript.includes('salir') || transcript.includes('atras')|| transcript.includes('cambio')) {
                currentCommand = null;
                updateUserMessage('Saliendo del modo actual.', 'msg');
                updateUserMessage('...', 'info');
                scene.emit('exit-create-mode');
                return;
            }
            // INICIO DE MODO CREAR
            if (transcript.includes('crear') && currentCommand !== 'crear') {
                currentCommand = 'crear';
                updateUserMessage('Dime que objeto crear:', 'msg');
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
                updateUserMessage(`¿Que asset quieres crear?`, 'msg');
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
            // GUARDAR ESCENA
            if (transcript.includes('guardar')) {
                updateUserMessage('Guardando la escena actual...', 'msg');

                if (typeof saveScene === 'function') {
                    saveScene(); // llamada a scene-saver
                    updateUserMessage('Escena guardada exitosamente.', 'info');
                } else {
                    updateUserMessage('Error: No se pudo guardar la escena.', 'info');
                }

                currentCommand = null;
                return;
            }
             // CARGAR ESCENA
            if (transcript.includes('cargar escena') || transcript.includes('cargar')) {
                updateUserMessage('Cargando la escena...', 'msg');
                if (typeof loadSceneFromStorage === 'function') {
                    loadSceneFromStorage(); // Llamar al cargador
                    updateUserMessage('Escena cargada exitosamente.', 'info');
                } else {
                    updateUserMessage('Error: No se pudo cargar la escena.', 'info');
                }
                currentCommand = null;
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
                    updateUserMessage('No puedes editar ni crear mientras estas en modo de eliminar.', 'warn');
                    return;
                }
                if (step === 'idDel') {
                    const torusElement = createTorus();
                    entityToDel = getEntityById(transcript);

                    if (entityToDel) {
                        entityToDel.appendChild(torusElement);
                        updateUserMessage(`¿Estas seguro que quieres eliminar ${entityToDel.id}? (Si / No)`, 'msg');
                    } else if (transcript.includes('cambio')){
                        updateUserMessage('Accion finalizando...', 'msg');
                        // Mostrar otro mensaje despues de 3 segundos
                        setTimeout(function () {
                            updateUserMessage("Reconocimiento de voz activado...",'msg');
                        }, 3000);  // 3000ms = 3 segundos                        
                    }else {
                        updateUserMessage('No se encontro un objeto con ese ID. ¿Intentamos de nuevo?', 'msg');
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
                    if (transcript.includes('si')) {
                        deleteConfirmed = true;
                        updateUserMessage(`${entityToDel.id} eliminado`, 'msg');
                        
                        // Eliminar torus antes de borrar
                        const torusToRemove = entityToDel.querySelector('#edit');
                        if (torusToRemove) {
                            entityToDel.removeChild(torusToRemove);
                        }

                        entityToDel.parentNode.removeChild(entityToDel);

                        setTimeout(() => {
                            updateUserMessage("Diga 'salir', 'atras' o 'cambio' para volver", 'msg');
                        }, 3000);
                        return;
                    } else if (transcript.includes('no')) {
                        deleteCancelled = true;
                        updateUserMessage("Eliminacion cancelada. Diga 'salir', 'atras' o 'cambio' para volver", 'msg');
                        return;
                    }
                }

                // Comandos para salir del modo
                const exitWords = ['salir', 'atras', 'cambio'];
                if (exitWords.some(word => transcript.includes(word))) {
                    // Eliminar torus si queda
                    if (entityToDel) {
                        const torusToRemove = entityToDel.querySelector('#edit');
                        if (torusToRemove) {
                            entityToDel.removeChild(torusToRemove);
                        }
                        updateUserMessage(`Finalizando eliminacion de ${entityToDel.id}`, 'msg');
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
        const objsCreated = document.querySelector('#objsCreated');
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
                entity.setAttribute('class', 'dynamic-object'); // ID único para modificarlo despues
                

                text = createText(cubeData)
                entity.appendChild(text);
                objsCreated.appendChild(entity);
                
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
                objsCreated.appendChild(entity);
                
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
                entity.setAttribute('class', 'dynamic-object'); // ID único para modificarlo despues
                

                text = createText(planeData)
                entity.appendChild(text);
                objsCreated.appendChild(entity);
                
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
                objsCreated.appendChild(entity);
                
                
                console.log('Datos de la luz:', JSON.stringify(lightData, null, 2));
                
                // Guardar JSON en localStorage (opcional)
                localStorage.setItem('lightData', JSON.stringify(lightData));
                // detecta una palabra 
                modifyingLight = true;
                currentObject = entity;
            }else if (objectType === 'contenedor') {
                // Datos del asset para el contenedor
                const assetData = {
                    id: 'conte',
                    gltfModel: '#contenedor', // Se refiere al asset ID definido en <a-assets>
                    position: { x: -4, y: 1, z: -3 },
                    geometry: { height: 1 },
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: 0.025, y: 0.025, z: 0.025 }
                };

                // Crear la entidad para el contenedor
                const entity = document.createElement('a-entity');
                entity.setAttribute('id', assetData.id);
                entity.setAttribute('gltf-model', assetData.gltfModel);
                entity.setAttribute('position', `${assetData.position.x} ${assetData.position.y} ${assetData.position.z}`);
                entity.setAttribute('scale', `${assetData.scale.x} ${assetData.scale.y} ${assetData.scale.z}`);
                entity.setAttribute('class', 'dynamic-object');

                // Crear el texto relacionado con la entidad (si es necesario)
                let text = createText(assetData);
                text.setAttribute('scale', '40 40 40');
                text.setAttribute('position', '0 86 0');
                entity.appendChild(text);

                // Añadir la entidad a la escena
                objsCreated.appendChild(entity);

                console.log('Datos del asset:', JSON.stringify(assetData, null, 2));

                // Guardar los datos del asset en localStorage (opcional)
                localStorage.setItem('assetData', JSON.stringify(assetData));

                // Detectar una palabra clave
                modifyingConteiner = true;
                currentObject = entity;
            } else if (objectType === 'radio') {
                // Datos del asset para el radio
                const asset2Data = {
                    id: 'radio',
                    gltfModel: 'assets/radio.glb', // Se refiere al asset ID definido en <a-assets>
                    position: { x: 4, y: 1, z: -3 },
                    geometry: { height: 1 },
                    rotation: { x: 0, y: 0, z: 0 },
                    scale: { x: 1.5, y: 1.5, z: 1.5 }
                };

                // Crear la entidad para el radio
                const entity = document.createElement('a-entity');
                entity.setAttribute('id', asset2Data.id);
                entity.setAttribute('gltf-model', asset2Data.gltfModel);
                entity.setAttribute('position', `${asset2Data.position.x} ${asset2Data.position.y} ${asset2Data.position.z}`);
                entity.setAttribute('scale', `${asset2Data.scale.x} ${asset2Data.scale.y} ${asset2Data.scale.z}`);
                entity.setAttribute('class', 'dynamic-object');

                // Crear el texto relacionado con la entidad (si es necesario)
                let text = createText(asset2Data);
                text.setAttribute('scale', '1 1 1');
                text.setAttribute('position', `0 ${asset2Data.position.y + 1} 0`);
                entity.appendChild(text);

                // Añadir la entidad a la escena
                objsCreated.appendChild(entity);

                console.log('Datos del asset:', JSON.stringify(asset2Data, null, 2));

                // Guardar los datos del asset en localStorage (opcional)
                localStorage.setItem('asset2Data', JSON.stringify(asset2Data));

                // Detectar una palabra clave
                modifyingRadio = true;
                currentObject = entity;
            } else {
                console.log(`Tipo de objeto no soportado: ${objectType}`);
            }

        });
    },
});

// Componente de comandos dinamicos para CREAR atributos
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
  
          updateUserMessage('¿Que valores quieres modificar?','msg');
          updateUserMessage('Posicion\nRotacion\nTamaño\nColor\nID', 'info');
  
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
            'posicion': { step: 'x', message: '¿Que valor para POS en X?' },
            'rotacion': { step: 'x-rot', message: '¿Que valor para ROT en X?' },
            'tamaño': { step: 'size', message: '¿Que tamaño?' },
            'color': { step: 'color', message: '¿Que color?' },
            'id': { step: 'id', message: '¿Que ID?' },
            'cambio': { exit: true },  // Salir del modo de modificacion pero permitir crear nuevo objeto
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
                                        // Mostrar otro mensaje despues de 3 segundos
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

// Componente de comandos dinamicos para EDITAR atributos
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
                        updateUserMessage(`Editando el objeto ${entityToEdit.id}. ¿Que valores quieres modificar?`,'msg');
                        updateUserMessage('Posicion\nRotacion\nTamaño\nColor\nID', 'info');
                    } else {
                        updateUserMessage('No se encontro. un objeto con ese ID. ¿Intentamos de nuevo?','msg');
                        setTimeout(function () {
                            updateUserMessage("Reconocimiento de voz activado...",'msg');
                        }, 3000);  // 3000ms = 3 segundos   
                    }

                    // Resetear paso despues de encontrar el objeto
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

                // Deteccio.n de palabras clave
                const keywordActions = {
                    'posicion': { step: 'x', message: '¿Que valor para POS en X?' },
                    'rotacion': { step: 'x-rot', message: '¿Que valor para ROT en X?' },
                    'tamaño': { step: 'size', message: '¿Que tamaño?' },
                    'color': { step: 'color', message: '¿Que color?' },
                    'id': { step: 'id', message: '¿Que ID?' },
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

                            // Mostrar otro mensaje despues de 3 segundos
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

        // Verifica si esta en modo creación al iniciar
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

// Componente para GUARDAR ESCENAS
AFRAME.registerComponent('scene-saver', {
    saveScene: function () {
        const scene = document.querySelector('a-scene');
        const objsCreated = document.querySelector('#objsCreated');

        if (!scene || !objsCreated) {
            console.error("No se ha encontrado la escena o el contenedor objsCreated.");
            return;
        }

        let savedScene = [];

        // Guardar todos los objetos dentro de objsCreated
        [...objsCreated.children].forEach(el => {
            let data = {
                tag: el.tagName.toLowerCase(),
                id: el.id || null,
                class: el.className || null,
                components: {},
                children: []  // Guardar los hijos de la entidad
            };

            // Guardar componentes importantes
            ['position', 'rotation', 'scale', 'geometry', 'material', 'light','gltf-model'].forEach(comp => {
                if (el.hasAttribute(comp)) {
                    data.components[comp] = AFRAME.utils.clone(el.getAttribute(comp));
                }
            });

            // Guardar los hijos de este elemento (si los tiene)
            [...el.children].forEach(child => {
                let childData = {
                    tag: child.tagName.toLowerCase(),
                    id: child.id || null,
                    class: child.className || null,
                    components: {}
                };

                // Guardar los componentes del hijo (incluyendo <a-text> si es el caso)
                ['position', 'rotation', 'scale', 'geometry', 'material', 'light','gltf-model'].forEach(comp => {
                    if (child.hasAttribute(comp)) {
                        childData.components[comp] = AFRAME.utils.clone(child.getAttribute(comp));
                    }
                });

                // Si el hijo es un <a-text>, guardar sus atributos específicos
                if (child.tagName.toLowerCase() === 'a-text') {
                    ['value','align','position', 'scale', 'color','width','look-at'].forEach(comp => {
                        if (child.hasAttribute(comp)) {
                            childData.components[comp] = AFRAME.utils.clone(child.getAttribute(comp));
                        }
                    });
                }
                data.children.push(childData);  // Guardar el hijo
            });

            savedScene.push(data);  // Agregar este elemento con sus hijos a la escena guardada
        });

        // Guardar en localStorage o enviarlo al backend
        const sceneJSON = JSON.stringify(savedScene, null, 2);
        console.log('Escena guardada:', sceneJSON);
        localStorage.setItem('savedScene', sceneJSON);
    },

    init: function () {
        // Ejecutar con un botón o llamada externa
        window.saveScene = this.saveScene.bind(this); // Puedes llamar saveScene() desde la consola
    }
});



// Componente para CARGAR ESCENAS
AFRAME.registerComponent('scene-loader', {
    init: function () {
        const scene = document.querySelector('a-scene');  // Asegúrate de que la escena existe

        if (!scene) {
            console.error("La escena no se ha encontrado.");
            return;
        }

        // Verificar si ya existe el contenedor objsCreated en la escena
        let objsCreated = document.querySelector('#objsCreated');

        // Si no existe, crearlo dinamicamente y agregarlo a la escena
        if (!objsCreated) {
            objsCreated = document.createElement('a-entity');
            objsCreated.setAttribute('id', 'objsCreated');
            scene.appendChild(objsCreated);  // Añadir a la escena
        }

        // Función para cargar la escena desde un JSON
        this.loadScene = function (jsonData) {
            if (!jsonData || jsonData.length === 0) {
                console.error("No se encontró ningún dato para cargar la escena.");
                return;
            }

            console.log("Datos de la escena: ", jsonData);

            // Limpiar solo los elementos dentro de #objsCreated
            const objsCreated = document.querySelector('#objsCreated');
            if (objsCreated) {
                // Limpiar los hijos dentro de #objsCreated
                [...objsCreated.children].forEach(child => {
                    objsCreated.removeChild(child);
                });
            }

            // Recorrer todos los objetos en el JSON y agregar los elementos dentro de "objsCreated"
            jsonData.forEach(obj => {
                const el = document.createElement(obj.tag);  // Crear el elemento A-Frame dinamicamente

                // Asegurarse de que los datos de atributos no esten vacíos
                if (obj.id) el.setAttribute('id', obj.id);
                if (obj.class) el.setAttribute('class', obj.class);

                // Agregar los componentes
                if (obj.components) {
                    for (let comp in obj.components) {
                        if (obj.components[comp]) {
                            el.setAttribute(comp, obj.components[comp]);
                        }
                    }
                }

                // Recargar los hijos (si existen) dentro de la entidad
                if (obj.children) {
                    obj.children.forEach(childData => {
                        const child = document.createElement(childData.tag);

                        if (childData.id) child.setAttribute('id', childData.id);
                        if (childData.class) child.setAttribute('class', childData.class);

                        // Agregar los componentes de los hijos
                        for (let comp in childData.components) {
                            if (childData.components[comp]) {
                                child.setAttribute(comp, childData.components[comp]);
                            }
                        }

                        el.appendChild(child);  // Agregar el hijo a su elemento padre
                    });
                }

                // Agregar el elemento dentro de "objsCreated"
                objsCreated.appendChild(el);
            });

            console.log('Escena cargada desde JSON.');
        };

        // Función para cargar la escena desde localStorage
        window.loadSceneFromStorage = () => {
            const saved = localStorage.getItem('savedScene');
            if (saved) {
                const json = JSON.parse(saved);

                console.log("Cargando escena desde localStorage:", json);

                this.loadScene(json);  // Llamar a la función para cargar la escena
            } else {
                console.warn('No se encontró ninguna escena guardada en localStorage.');
            }
        };
    }
});

AFRAME.registerComponent('scene-creator', {
    init: function () {
        // ------------------------
        // Verificar o crear <a-assets>
        // Buscar la escena principal y añadirle los assets
        // ------------------------
    let scene = document.querySelector('a-scene');
    if (scene) {
        let assets = scene.querySelector('a-assets');
        if (!assets) {
            assets = document.createElement('a-assets');
            scene.appendChild(assets);
        }

        // Crear asset del contenedor
        const contenedorAsset = document.createElement('a-asset-item');
        contenedorAsset.setAttribute('id', 'contenedor');
        contenedorAsset.setAttribute('src', 'assets/contenedor.glb');
        
        // Crear asset del radio
        const radioAsset = document.createElement('a-asset-item');
        radioAsset.setAttribute('id', 'radio');
        radioAsset.setAttribute('src', 'assets/radio.glb');

        // Agregar evento para asegurarse de que los assets se han cargado
        contenedorAsset.addEventListener('loaded', () => {
            console.log('Contenedor GLB cargado');
        });
        contenedorAsset.addEventListener('error', (e) => {
            console.error('Error al cargar el contenedor GLB:', e);
        });

        radioAsset.addEventListener('loaded', () => {
            console.log('Radio GLB cargado');
        });
        radioAsset.addEventListener('error', (e) => {
            console.error('Error al cargar el radio GLB:', e);
        });

        assets.appendChild(contenedorAsset);
        assets.appendChild(radioAsset);
    } else {
        console.warn('No se encontró <a-scene>, no se pudieron añadir los assets.');
    }

                // ------------------------
        // AÑADIR COMPONENTES PERSONALIZADOS COMO HIJOS
        // ------------------------
        const customComponents = [
            { name: 'info-panel' },
            { name: 'text-message' },
            { name: 'player-move' }
        ];

        customComponents.forEach(({ name }) => {
            const e = document.createElement('a-entity');
            e.setAttribute(name, ''); // Asigna el componente personalizado
            this.el.appendChild(e);   // Lo añade como hijo de esta entidad
        });

        // ------------------------
        // Entidades dinamicas
        // ------------------------
        const entities = [
            { id: 'create', component: 'command-handler' },
            { id: 'object', component: 'object-creator', input: '#create' },
            { id: 'dynamic-modifier', component: 'dynamic-modifier' },
            { id: 'edit', component: 'edit-mode-handler' },
            { id: 'delete', component: 'delete-object' },
            { id: 'saver', component: 'scene-saver' },
            { id: 'loader', component: 'scene-loader' },
            { id: 'transcriptPanel', component: 'transcript-panel' },
        ];
        entities.forEach(({ id, component, input = '#voiceInputBox' }) => {
            const e = document.createElement('a-entity');
            e.setAttribute('id', id);
            e.setAttribute(component, `input: ${input}`);
            this.el.appendChild(e);
        });


    }
});
