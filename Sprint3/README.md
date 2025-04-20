# Demos con A-Frame + Reconocimiento de Voz

Este proyecto contiene dos demos interactivas desarrolladas con **A-Frame**.

El objetivo fue comenzar a experimentar con la integración de **texto dinámico** en escenas 3D y luego vincularlo con **reconocimiento de voz**, para mostrar contenido en tiempo real dentro del entorno virtual.

## Demos Incluidas

###  Demo 1 – Texto Dinámico con A-Frame

- Se crea una escena con un plano (`a-plane`) y un texto (`a-text`) posicionado sobre él.
- El contenido del texto se puede modificar escribiendo desde un campo de entrada HTML o desde el código.
- Esta demo demuestra cómo manipular dinámicamente elementos de A-Frame desde JavaScript estándar.

1. [Demos Texto Dinámico](https://r4cc00n.github.io/SpeechRecognition_in_Browser/Sprint3/v1_A-Frame.html)    


### Demo 2 – Reconocimiento de Voz + A-Frame

- Extiende la demo anterior agregando reconocimiento de voz desde el navegador (usando `Web Speech API`).
- Al hablar, el texto reconocido aparece automáticamente en el elemento `a-text` dentro de la escena.
- La experiencia permite mostrar mensajes de voz directamente dentro de un entorno 3D.
1. [Demos Texto Dinámico con reconocimiento de Voz](https://r4cc00n.github.io/SpeechRecognition_in_Browser/Sprint3/v1_A-Frame.html)  

**Cómo funciona:**

1. El usuario activa el reconocimiento de voz (por botón o al entrar a la escena).
2. El navegador convierte la voz en texto.
3. El texto se muestra en tiempo real dentro del plano de A-Frame.

## Requisitos

- Navegador compatible con A-Frame y Web Speech API (Chrome recomendado).
- No requiere instalación, solo abrir los archivos `.html` en el navegador.

