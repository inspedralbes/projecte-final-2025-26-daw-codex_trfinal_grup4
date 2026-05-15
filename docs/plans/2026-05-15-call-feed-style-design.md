# Plan de Diseño: Adaptación de la Interfaz de Llamadas y Videollamadas

**Fecha**: 2026-05-15
**Tema**: Adaptar la interfaz de llamadas al estilo de la página y hacerla responsive, limitada al layout central.

## Objetivo
Modificar la interfaz de llamadas y videollamadas (`VideoCall.jsx` / `VideoCall.css`) para que no cubra toda la pantalla, sino que se mantenga flotando dentro de la columna central (`.main-content`), adaptándose al estilo visual del proyecto y siendo completamente responsive.

## Diseño Propuesto

### 1. Posicionamiento y Estructura
- **Contenedor Padre**: El componente se renderizará dentro de `.main-content`, que actúa como el contenedor de la columna central y tiene `position: relative`.
- **Posicionamiento**: Se cambiará la clase principal (actualmente `.vc-overlay` con `position: fixed`) a `position: absolute`. Esto limitará el fondo y la interfaz al ancho y alto de la columna central.
- **Capas (Z-Index)**: Se asignará un `z-index` adecuado (ej. `10`) para que quede por encima del contenido del feed, pero sin solapar elementos globales externos si los hubiera.
- **Dimensiones**: Tendrá un `max-width: 100%` para asegurar que nunca desborde el contenedor central.

### 2. Estilo Visual (Aesthetics)
- **Variables CSS**: Se utilizarán las variables del proyecto como `--color-surface`, `--border-default` y `--codex-coral` para mantener la coherencia de colores.
- **Estética**: Se mantendrá el estilo actual (brutalista/moderno con bordes marcados) pero asegurando que se integre visualmente con el resto de la página.

### 3. Responsividad
- **Escritorio**: Se mostrará como una caja centrada dentro de la columna central con un tamaño máximo controlado (ej. `max-width: 600px`).
- **Móvil (<= 768px)**: Ocupará el 100% del ancho y alto disponible en la columna central, ajustando los tamaños de fuente y controles para uso táctil.
