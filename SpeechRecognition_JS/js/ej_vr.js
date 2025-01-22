AFRAME.registerComponent('input-text', {
    init: function () {
        var el = this.el;
        const button = document.querySelector('#grabadora');
        var planeText = document.querySelector('#planeText');
        var scene = document.querySelector('a-scene');
        var recognition;
        var isRecording = false;
        const components = ['cubo', 'esfera', 'plano', 'cilindro'];

        if ('webkitSpeechRecognition' in window) {
            recognition = new webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'es-ES';
        } else {
            console.error('API de reconocimiento de voz no soportada en este navegador');
        }

        let currentCommand = null;

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

        button.addEventListener('click', () => {
            if (!isRecording) {
                if (recognition) {
                    recognition.start();
                    isRecording = true;
                    planeText.setAttribute('value', 'Escuchando...');
                }
            } else {
                if (recognition) {
                    recognition.stop();
                    isRecording = false;
                    planeText.setAttribute('value', 'Grabación detenida');
                }
            }
        });

        if (recognition) {
            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    transcript += event.results[i][0].transcript;
                }

                // Convertir números en la transcripción directamente
                transcript = convertirTextoANumero(transcript);

                // Mostrar la transcripción en la consola
                console.log('Transcripción procesada:', transcript);

                const lowerText = transcript.toLowerCase();
                planeText.setAttribute('value', transcript);

                // Comandos después de la transcripción procesada
                if (lowerText.includes('crear')) {
                    currentCommand = 'crear';
                    planeText.setAttribute('value', 'Dime qué objeto crear (cubo, esfera, plano, cilindro)');
                } else if (currentCommand === 'crear' && components.some((comp) => lowerText.includes(comp))) {
                    const objectType = components.find((comp) => lowerText.includes(comp));
                    planeText.setAttribute('value', `Creando un ${objectType}. Ahora dime la posición x.`);
                    currentCommand = { type: 'crear', object: objectType, position: { x: null, y: null, z: null }, size: null, step: 'x' };
                } else if (currentCommand && currentCommand.step === 'x' && lowerText.includes('x')) {
                    const xMatch = lowerText.match(/(-?\d+)/);
                    if (xMatch) {
                        currentCommand.position.x = Number(xMatch[0]);
                        planeText.setAttribute('value', `Posición x: ${currentCommand.position.x}. Ahora dime la posición y.`);
                        currentCommand.step = 'y';
                    }
                } else if (currentCommand && currentCommand.step === 'y' && lowerText.includes('y')) {
                    const yMatch = lowerText.match(/(-?\d+)/);
                    if (yMatch) {
                        currentCommand.position.y = Number(yMatch[0]);
                        planeText.setAttribute('value', `Posición y: ${currentCommand.position.y}. Ahora dime la posición z.`);
                        currentCommand.step = 'z';
                    }
                } else if (currentCommand && currentCommand.step === 'z' && lowerText.includes('z')) {
                    const zMatch = lowerText.match(/(-?\d+)/);
                    if (zMatch) {
                        currentCommand.position.z = Number(zMatch[0]);
                        planeText.setAttribute('value', 'Dime el tamaño');
                        currentCommand.step = 'size';
                    }
                } else if (currentCommand && currentCommand.step === 'size' && lowerText.includes('tamaño')) {
                    const sizeMatch = lowerText.match(/(-?\d+)/);
                    if (sizeMatch) {
                        currentCommand.size = Number(sizeMatch[0]);
                        planeText.setAttribute(
                            'value',
                            `Creando ${currentCommand.object} en posición (${currentCommand.position.x}, ${currentCommand.position.y}, ${currentCommand.position.z}) con tamaño ${currentCommand.size}.`
                        );

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
            };

            recognition.onerror = (event) => {
                console.error('Error en el reconocimiento de voz:', event.error);
                planeText.setAttribute('value', 'Error al escuchar');
            };
        }
    }
});
