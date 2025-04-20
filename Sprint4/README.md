# Demos de Creación de Objetos con Voz en A-Frame

Este proyecto contiene **tres demos interactivas** en las que se combina **A-Frame** con **reconocimiento de voz** para crear objetos 3D dentro de una escena usando comandos hablados.

Cada demo mejora la anterior, especialmente en el reconocimiento y manejo de **coordenadas y números**, permitiendo finalmente la creación precisa de objetos con posición y tamaño definidos por voz.

---

## Demo 1 – Comando Básico y Reconocimiento Inicial

**Comando:** `"crear [objeto]"`, seguido de `"posición"` y `"tamaño"`.

### Funcionalidad:
- Reconoce el comando “crear” seguido del tipo de objeto: `cubo`, `esfera`, `plano` o `cilindro`.
- Solicita las coordenadas y el tamaño por voz.
- Muestra mensajes en pantalla con `a-text`.

### Limitaciones:
- ❌ El reconocimiento de números es poco confiable.
- ❌ Las coordenadas se capturan como un bloque (`123`), sin separación por eje.
- ❌ No se interpretan valores negativos.
- ✅ Aún así, se logra crear un objeto básico en la escena.

---

## Demo 2 – Separación de Coordenadas y Mejora Numérica

### Mejoras:
- ✅ El sistema comienza a **reconocer mejor los números hablados**.
- ✅ Las **coordenadas se manejan por separado** (X, Y, Z), lo que permite más control sobre la posición.
- 🟡 Aún hay limitaciones al interpretar números complejos o negativos.


## Demo 3 – Manejo de Números Negativos y Correcciones

### Novedades:
- ✅ Implementación de un **manejador de números positivos y negativos**.
- ✅ Mejora en la segmentación del input por voz.
- ✅ Se corrigen errores previos, permitiendo casos más variados y precisos.


## Como Probar
1. [Demos Comando Basico](https://r4cc00n.github.io/SpeechRecognition_in_Browser/Sprint4/Create_Obj_v1.html)    
2. [Demos Separacion de Coordenadas](https://r4cc00n.github.io/SpeechRecognition_in_Browser/Sprint4/Create_Obj_v2.html)    
3. [Demos Manejador de Numeros y Coordenadas](https://r4cc00n.github.io/SpeechRecognition_in_Browser/Sprint4/Create_Obj_v3.html)    

