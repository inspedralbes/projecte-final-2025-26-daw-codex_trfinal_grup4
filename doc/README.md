# Documentacion Tecnica de Codex

Este directorio contiene la documentacion tecnica completa del proyecto. Cada modulo del sistema tiene su propio documento exhaustivo.

---

## Indice de documentos

| Documento | Descripcion |
| --- | --- |
| [BACKEND.md](./BACKEND.md) | API REST Laravel: rutas completas con parametros y respuestas, flujos de datos (auth, Google OAuth, notificaciones, aprobacion de centros), librerias PHP y su implementacion, esquema de base de datos y cobertura de tests. |
| [FRONTEND.md](./FRONTEND.md) | SPA React: paginas y sus funciones, sistema de diseno (colores, tipografia, responsive), librerias JS y su implementacion, contextos globales (Auth, Socket, Theme) y estructura de componentes. |
| [SOCKET.md](./SOCKET.md) | Servidor Socket.io: flujos de tiempo real (Redis Pub/Sub y mensajes directos), sistema de salas, todos los eventos emitidos y escuchados, WebRTC para llamadas, librerias y variables de entorno. |
| [AI_MODERATION.md](./AI_MODERATION.md) | Microservicio de IA: modelos utilizados (toxic-bert, mDeBERTa-v3, LLM opcional), logica de decision combinada, endpoints del servicio, umbrales de configuracion, summarizacion y embeddings, integracion con Laravel. |
| [DOCKER.md](./DOCKER.md) | Infraestructura Docker: mapa de contenedores, diferencias dev vs. prod, configuracion de Nginx (dev y prod), todas las variables de entorno del .env explicadas, volumenes y comandos frecuentes. |
| [PROJECT_CONCEPT.md](./PROJECT_CONCEPT.md) | Vision del producto, arquitectura conceptual del "Doble Portal" (Feed Global + Hub del Centro), tipos de publicaciones, sistema de roles, diseno de UI y estado de implementacion. |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Diagrama de arquitectura de microservicios, flujo de comunicacion entre componentes y stack de tecnologias. |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Guia para contribuidores: configuracion del entorno, estandares de codigo (PSR-12, Conventional Commits) y flujo de trabajo con Pull Requests. |

---

## Arranque rapido para desarrollo

**Requisitos:** Docker y Docker Compose instalados.

```bash
git clone https://github.com/inspedralbes/projecte-final-2025-26-daw-codex_trfinal_grup4.git
cd projecte-final-2025-26-daw-codex_trfinal_grup4
git checkout dev
chmod +x init-dev.sh && ./init-dev.sh
```

**Accesos en desarrollo:**

| Servicio | URL |
|---|---|
| Aplicacion (SPA) | http://localhost:8080 |
| API directa | http://localhost:8080/api |
| Adminer (base de datos) | http://localhost:8081 |
| Mailpit (emails) | http://localhost:8025 |

---

## Equipo de desarrollo

| Nombre | Rol |
|---|---|
| Izan De La Cruz | Desarrollador |
| Marc Rojano | Desarrollador |
| Iker Delgado | Desarrollador |
| Pol Diaz | Desarrollador |
