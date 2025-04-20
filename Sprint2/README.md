# Reconocimiento de Voz – Desarrollo e Investigación

Este repositorio contiene el resultado de una investigación práctica sobre tecnologías de **reconocimiento de voz**, explorando diferentes enfoques y herramientas en distintos entornos.

## Ejemplos Desarrollados

Se desarrollaron **tres ejemplos** para demostrar cómo implementar reconocimiento de voz en distintos contextos:

### 1. Python (Reconocimiento con Whisper)

- Utiliza el modelo **Whisper** de OpenAI para transcripción de audio.
- Permite convertir archivos de audio a texto con alta precisión.
- Ideal para pruebas locales y procesamiento por lotes.
- Compatible con múltiples idiomas y resistente a ruido de fondo.

### 2. Node.js + Python (Servidor backend híbrido)

- El servidor está hecho en **Node.js** con `Express`.
- Recibe archivos de audio desde el cliente.
- Llama internamente a un **script en Python** que utiliza **Whisper** para realizar la transcripción.
- Devuelve el texto transcrito al cliente.
- Combina lo mejor de ambos mundos: la flexibilidad de Node y la potencia de Whisper.
- No llego a funcionar por que necesitaba permisos.

### 3. Navegador (Reconocimiento en el cliente)

- Basado en la **Web Speech API** del navegador.
- Captura y transcribe voz directamente desde el navegador, en tiempo real.
- No requiere backend ni dependencias externas.

## Objetivos

- Explorar y comparar distintas tecnologías de reconocimiento de voz.
- Evaluar precisión, facilidad de implementación y rendimiento.
- Servir como base para futuros desarrollos más avanzados.

## Requisitos

Cada ejemplo tiene sus propias dependencias. Revisa las carpetas individuales (`/Python`, `/Node+Python`, `/Navegador`) para más información.


