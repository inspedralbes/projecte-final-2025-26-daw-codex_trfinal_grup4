# PROJECT_CONCEPT.md

> **Nombre del Proyecto:** Codex  
> **Tipo:** Red Social Académica Vertical  
> **Público Objetivo:** Estudiantes, Profesores y Alumni de FP Informática en España (DAM, DAW, ASIX).  
> **Estado:** Frontend UI implementado ✓

---

## 1. Visión del Producto
**Codex** (anteriormente DevNet FP) es una Red Social Académica Vertical diseñada exclusivamente para el ecosistema de Formación Profesional en Informática (DAM, DAW, ASIX).

A diferencia de las redes sociales generalistas, Codex prioriza la **identidad profesional** y la **colaboración académica**. No es un clon de Twitter/X; es una plataforma con personalidad propia, seria pero dinámica, inspirada en herramientas de productividad y entornos de desarrollo (como VS Code, GitHub o Linear) pero con el factor social de una comunidad viva.

Su estética ("Academic Dark Mode") huye del "azul genérico" y apuesta por una interfaz sofisticada, limpia y orientada al código, utilizando paletas de colores profundos (Deep Slate, Teal, Purple) que reducen la fatiga visual durante largas sesiones de estudio o programación.

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

## 6. Sistema de Diseño UI

### Paleta de Colores ("Academic Dark Mode")
| Token | Valor | Uso |
|-------|-------|-----|
| `--codex-deep-slate` | `#0f1419` | Fondo base |
| `--codex-teal` | `#14b8a6` | Acento primario |
| `--codex-violet` | `#8b5cf6` | Acento secundario |
| `--codex-amber` | `#f59e0b` | Avisos/Centro |
| `--codex-emerald` | `#10b981` | Éxito/Puntos |

### Tipografía
- **UI:** Plus Jakarta Sans (sans-serif)
- **Código:** JetBrains Mono (monospace)

### Escala de Superficies
Sistema de elevación con 6 niveles (`--surface-depth-0` a `--surface-depth-5`) para crear jerarquía visual mediante profundidad.

### Componentes Principales
- **Cards:** Bordes sutiles, hover con elevación
- **Badges:** Pills redondeadas con colores semánticos (DAW=teal, DAM=violet)
- **Code Blocks:** Fondo elevado con syntax highlighting
- **Buttons:** Primary (teal gradient), Secondary (outline)

---

## 7. Estructura de Pantallas

### Rutas Implementadas
| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/welcome` | Landing | Página de bienvenida con autenticación |
| `/` | Home → Feed | Feed Global con tabs (Para ti / Siguiendo / Dudas) |
| `/center` | CenterHub | Dashboard del centro educativo |
| `/explore` | Explore | Búsqueda y descubrimiento |
| `/notifications` | Notifications | Stream de actividad |
| `/profile` | Profile | Perfil de desarrollador |
| `/messages` | Messages | Chat (pendiente) |

### Arquitectura de Componentes
```
src/
├── pages/
│   ├── Landing.jsx          # Auth + Hero
│   ├── Explore.jsx          # Search + Widgets
│   ├── Notifications.jsx    # Activity stream
│   └── CenterHub.jsx        # Hub institucional
├── components/
│   ├── layout/
│   │   ├── MainLayout.jsx   # Shell 3-columnas
│   │   ├── Sidebar.jsx      # Navegación principal
│   │   └── RightSection.jsx # Widgets laterales
│   ├── feed/
│   │   ├── Feed.jsx         # Lista de posts
│   │   ├── PostInput.jsx    # Editor de publicación
│   │   └── PostCard.jsx     # Tarjeta de post
│   └── profile/
│       └── Profile.jsx      # Perfil de usuario
└── styles/
    ├── variables.css        # Design tokens
    ├── base.css             # Reset + Typography
    └── index.css            # Entry point
```

---

## 8. Documentación Técnica
Para detalles específicos sobre la implementación técnica de cada microservicio, consulta los siguientes archivos de contexto:

*   **Backend (API):** [api/CONTEXT.md](../api/CONTEXT.md)
*   **Frontend (Cliente):** [client/CONTEXT.md](../client/CONTEXT.md)
*   **Real-time (Socket):** [socket/CONTEXT.md](../socket/CONTEXT.md)

---

## 9. Próximos Pasos
- [ ] Integración con API real (reemplazar mockApi)
- [ ] Sistema de autenticación con validación de dominios educativos
- [ ] WebSocket para notificaciones en tiempo real
- [ ] Chat/Mensajes directos
- [ ] Sistema de puntos y gamificación
- [ ] Moderación para profesores en Hub del Centro
