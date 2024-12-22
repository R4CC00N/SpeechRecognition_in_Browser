// Verificar si el navegador soporta la API de reconocimiento de voz
if (!('webkitSpeechRecognition' in window)) {
  alert("Tu navegador no soporta la API de reconocimiento de voz.");
} else {
  // Crear una nueva instancia de la API de reconocimiento de voz
  const recognition = new webkitSpeechRecognition();
  recognition.lang = "es-ES"; // Configurar el idioma a español
  recognition.interimResults = true; // Activar resultados intermedios
  recognition.continuous = true; // Escuchar continuamente

  // Obtener el elemento donde se muestra el texto
  const textoElemento = document.getElementById("texto");

  // Variable para controlar el estado del reconocimiento
  let escuchando = false;

  // Evento cuando se detecta una transcripción
  recognition.onresult = function (event) {
    const transcript = event.results[event.resultIndex][0].transcript.toLowerCase(); // Obtener la transcripción

    // Mostrar la transcripción en pantalla
    textoElemento.innerText = transcript;

    // Cambiar el fondo y el texto dependiendo de la palabra reconocida
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
  window.startRecognition = function () {
    if (!escuchando) {
      recognition.start(); // Iniciar el reconocimiento de voz
      escuchando = true;
      textoElemento.innerText = "Escuchando...";
      document.body.style.backgroundColor = "white"; // Restaurar color de fondo a blanco
      textoElemento.style.color = "black"; // Restaurar color de texto a negro
    }
  };

  // Función para detener el reconocimiento
  window.stopRecognition = function () {
    if (escuchando) {
      recognition.stop(); // Detener el reconocimiento de voz
      escuchando = false;
      textoElemento.innerText = "Reconocimiento detenido.";
    }
  };
}
