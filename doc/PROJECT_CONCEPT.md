# PROJECT_CONCEPT.md

> **Nombre del Proyecto:** Codex
> **Tipo:** Red Social Académica Vertical
> **Público Objetivo:** Estudiantes, Profesores y Alumni de FP Informática en España (DAM, DAW, ASIX).

---

## 1. Visión del Producto
**DevNet FP** es una plataforma que fusiona la dinámica ágil de una red social pública (tipo Twitter/X) con la privacidad y utilidad de una intranet educativa.

Su propósito principal es romper el aislamiento de los centros de Formación Profesional. Permite que un alumno de un instituto pequeño conecte con la comunidad global de desarrolladores, al mismo tiempo que mantiene un canal de comunicación privado y seguro con sus compañeros de clase y profesores.

---

## 2. Arquitectura Conceptual: El Sistema de "Doble Portal"
La característica definitoria de la plataforma es la coexistencia de dos entornos digitales separados por permisos de acceso, pero integrados en la misma interfaz:

### A. El Feed Global (La Plaza Pública)
Es el punto de encuentro abierto.
* **Quién accede:** Cualquier usuario registrado en la plataforma.
* **Qué sucede aquí:** Networking transversal. Un alumno de Sevilla puede resolver una duda de PHP a uno de Bilbao. Se comparten noticias de tecnología, proyectos personales y tendencias del sector.
* **Objetivo:** Crear comunidad, visibilidad profesional y aprendizaje colaborativo a nivel nacional.

### B. El Hub del Centro (El Aula Privada)
Es el entorno protegido y exclusivo.
* **Quién accede:** Únicamente los usuarios que se han registrado con un **email corporativo/educativo válido** (ej: `@alu.iesjaume.es`). El sistema valida el dominio automáticamente.
* **Aislamiento:** El contenido publicado aquí es **invisible** para el resto del mundo. Es un "Walled Garden" (Jardín Vallado).
* **Qué sucede aquí:** Comunicación interna. Avisos de exámenes, dudas específicas sobre las prácticas de un profesor, organización de eventos del centro o hackathons locales.

---

## 3. Funcionalidades de Publicación y Contenido
El contenido está diseñado específicamente para las necesidades de un desarrollador en formación.

### Tipos de Publicaciones (Posts)
1.  **Estado General:** Texto plano para opiniones o actualizaciones rápidas.
2.  **Duda Técnica ("Help Request"):** Formato especial que destaca visualmente. Permite a otros usuarios aportar soluciones y al autor marcar una respuesta como "Solución Verificada" (similar a Stack Overflow).
3.  **Snippet de Código:** El editor incluye un bloque específico para pegar código. El sistema reconoce el lenguaje (Java, Python, JS) y aplica coloreado de sintaxis para facilitar la lectura.
4.  **Recurso / Enlace:** Para compartir tutoriales, documentación o repositorios de GitHub.

### Interacciones
* **Valoración:** "Me Gusta" (Like) para dar feedback positivo.
* **Difusión:** "Repost" para compartir contenido interesante en tu propio perfil.
* **Colección:** "Guardar" (Bookmark) para crear una biblioteca personal de recursos útiles.
* **Hilos:** Comentarios anidados para mantener conversaciones organizadas.

---

## 4. Organización Inteligente: Etiquetas y Canales
En lugar de carpetas estáticas, el sistema utiliza un flujo dinámico basado en etiquetas (#Tags).

* **En el Feed Global:** Las etiquetas funcionan como tendencias (#Laravel, #Hackathon).
* **En el Hub del Centro:** Las etiquetas actúan como **canales de suscripción**.
    * Ejemplo: Un alumno de 2º año puede suscribirse a las etiquetas `#2DAW` y `#OfertasFCT`.
    * El sistema le notificará *solo* cuando haya actividad en esas etiquetas dentro de su centro, ignorando el ruido de los alumnos de 1º año (`#1DAM`).

---

## 5. Roles de Usuario y Gamificación
La plataforma reconoce diferentes niveles de autoridad y participación.

### Roles
1.  **Estudiante:** Usuario base validado por email de centro. Puede publicar en ambos portales.
2.  **Profesor:** Usuario verificado (insignia visual). Tiene permisos de moderación en el Hub del Centro y sus avisos pueden fijarse en la parte superior del feed.
3.  **Alumni (Ex-alumno):** Usuario que ya se graduó. Mantiene acceso al global y puede tener permisos especiales para publicar ofertas laborales en su antiguo centro.
4.  **Usuario General:** Autodidacta o sin centro adscrito. Solo tiene acceso al Feed Global.

### Perfil Profesional
* **Portfolio en vivo:** El perfil muestra no solo la biografía, sino las tecnologías que domina (Stack) y sus mejores aportaciones de código.
* **Reputación:** Sistema de puntos basado en la ayuda aportada a la comunidad (dudas resueltas).

---


---

## 6. Documentación Técnica
Para detalles específicos sobre la implementación técnica de cada microservicio, consulta los siguientes archivos de contexto:

*   **Backend (API):** [api/CONTEXT.md](../api/CONTEXT.md)
*   **Frontend (Cliente):** [client/CONTEXT.md](../client/CONTEXT.md)
*   **Real-time (Socket):** [socket/CONTEXT.md](../socket/CONTEXT.md)
