// UN CASO CON Web Speech API 

// Verificar si el navegador soporta la API de reconocimiento de voz
if (!('webkitSpeechRecognition' in window)) {
    alert("Tu navegador no soporta la API de reconocimiento de voz.");
  } else {
    // Crear una nueva instancia de la API de reconocimiento de voz
    const recognition = new webkitSpeechRecognition();
    recognition.lang = "es-ES";  // Configurar el idioma a español de España
    recognition.interimResults = true;  // Activar resultados intermedios
    recognition.maxAlternatives = 1;  // Número máximo de alternativas por reconocimiento
  
    // Obtener el elemento donde se muestra el texto
    const textoElemento = document.getElementById("texto");
  
    // Evento cuando el reconocimiento detecta una transcripción
    recognition.onresult = function(event) {
      const transcript = event.results[event.resultIndex][0].transcript.toLowerCase();  // Obtener la transcripción
  
      // Mostrar la transcripción en la pantalla
      textoElemento.innerText = transcript;
  
      // Cambiar el fondo y la palabra dependiendo de lo que se dijo
      // CASOS VARIOS
      if (transcript.includes("verde")) {
        document.body.style.backgroundColor = "green";
        textoElemento.innerText = "Verde";
        textoElemento.style.color = "white";
      } else if (transcript.includes("rojo")) {
        document.body.style.backgroundColor = "red";
        textoElemento.innerText = "Rojo";
        textoElemento.style.color = "white";
      }
    };
  
    // Función para iniciar el reconocimiento
    function startRecognition() {
      recognition.start();  // Iniciar el reconocimiento de voz
      textoElemento.innerText = "Escuchando...";
      document.body.style.backgroundColor = "white";  // Restaurar color de fondo a blanco
      textoElemento.style.color = "black";  // Restaurar color de texto a negro
    }
  }
  
