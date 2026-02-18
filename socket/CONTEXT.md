# ⚡ CONTEXT – Real-time (Node.js + Socket.io)

> **Directrius i registre de canvis per a la carpeta `socket/`.**
> Llegeix SEMPRE aquest fitxer abans de treballar al servei de WebSockets.

---

## 📌 Informació del servei

| Camp | Valor |
|---|---|
| **Runtime** | Node.js 20 (Alpine) |
| **Framework HTTP** | Express 4 |
| **WebSockets** | Socket.io 4 |
| **Redis client** | ioredis 5 |
| **Port** | 3000 (intern, no exposat) |
| **Accés** | `ws://localhost:8080/socket.io/` (via Nginx) |
| **Contenidor** | `tfg_socket_dev` |
| **Directori al contenidor** | `/app` |
| **Hot reload** | nodemon (dev) |

---

## ✅ QUÈ POTS FER

- Crear handlers d'events Socket.io a `handlers/` o `events/`
- Crear middleware de Socket.io per autenticació
- Crear mòduls a `utils/` o `lib/`
- Configurar Redis Adapter per a Socket.io (Pub/Sub)
- Crear rooms i namespaces de Socket.io
- Afegir endpoints HTTP a Express (health checks, webhooks)
- Instal·lar paquets npm
- Crear fitxers de configuració a `config/`
- Escoltar events publicats des de Laravel via Redis

## ❌ QUÈ NO POTS FER

- **NO modificar el `Dockerfile`** — Està a la infraestructura compartida
- **NO modificar `docker-compose.*.yml`** — Gestió centralitzada
- **NO accedir directament a MySQL** — Tota la lògica de BD és a Laravel
- **NO crear una API REST completa aquí** — Només WebSockets + endpoints auxiliars
- **NO servir fitxers estàtics** — Això ho fa Nginx
- **NO canviar el port 3000** — Coordinat amb Nginx i docker-compose
- **NO canviar el path `/socket.io/`** — Coordinat amb Nginx
- **NO crear fitxers fora de `socket/`** — Cada servei és independent
- **NO utilitzar `socket.io-client`** aquí — Això és el servidor, el client va a `client/`
- **NO instal·lar TypeScript** — El projecte usa JS pur (CommonJS)

## ⚠️ REGLES IMPORTANTS

1. **Punt d'entrada:** El fitxer principal és `index.js`. No canviïs el nom.

2. **Format del codi:** CommonJS (`require`/`module.exports`), NO ES Modules.

3. **Comunicació amb Laravel:**
   - Laravel publica events a Redis → Socket.io els escolta i els reenvia als clients.
   - Utilitza `ioredis` per subscriure't a canals Redis:
     ```js
     const Redis = require('ioredis');
     const subscriber = new Redis({
       host: process.env.REDIS_HOST,
       port: process.env.REDIS_PORT
     });
     subscriber.subscribe('channel-name');
     subscriber.on('message', (channel, message) => {
       io.emit('event-name', JSON.parse(message));
     });
     ```

4. **Estructura de carpetes recomanada:**
   ```
   socket/
   ├── index.js           # Punt d'entrada (Express + Socket.io)
   ├── handlers/           # Handlers d'events per namespace
   │   ├── chatHandler.js
   │   └── gameHandler.js
   ├── middleware/          # Middleware Socket.io (auth, etc.)
   │   └── authMiddleware.js
   ├── config/             # Configuració
   │   └── redis.js
   ├── utils/              # Utilitats
   ├── package.json
   └── .env
   ```

5. **Namespaces:** Per organitzar events, utilitza namespaces de Socket.io:
   ```js
   const chatNamespace = io.of('/chat');
   const gameNamespace = io.of('/game');
   ```

6. **Autenticació:** Valida tokens JWT al middleware de Socket.io:
   ```js
   io.use((socket, next) => {
     const token = socket.handshake.auth.token;
     // Validar token contra l'API de Laravel
     next();
   });
   ```

7. **Health check:** L'endpoint `GET /health` ha d'existir sempre per monitorització.

8. **Logs:** Utilitza `console.log` amb prefix `[Socket.io]` per facilitar el filtratge als logs Docker.

---

## 🔧 Configuració actual

### package.json – Dependències
```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "ioredis": "^5.4.1",
    "socket.io": "^4.7.5"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

### Variables d'entorn (`.env`)
| Variable | Valor (dev) | Descripció |
|---|---|---|
| `NODE_ENV` | `development` | Entorn |
| `PORT` | `3000` | Port del servidor |
| `REDIS_HOST` | `redis` | Host Redis (nom del contenidor) |
| `REDIS_PORT` | `6379` | Port Redis |
| `REDIS_PASSWORD` | *(buit)* | Password Redis (buit en dev) |
| `CORS_ORIGIN` | `http://localhost:8080` | Origen permès per CORS |

### Flux de comunicació
```
┌──────────┐    Redis Pub/Sub    ┌──────────┐    WebSocket    ┌──────────┐
│  Laravel  │ ──────────────────▶│ Socket.io│ ──────────────▶│  React   │
│  (API)    │                    │ (Node.js)│ ◀──────────────│ (Client) │
└──────────┘                    └──────────┘    Events       └──────────┘
```

---

## 📅 Registre de canvis

### 2026-02-13 – Infraestructura inicial
- **Autor:** @chuclao
- Creat `Dockerfile` multi-stage Node 20 (dev amb nodemon / prod amb node)
- Creat `package.json` amb express, socket.io, ioredis, dotenv, cors
- Creat `index.js` amb servidor Express + Socket.io bàsic
- Configurat health check a `GET /health`
- Creat `.env` amb connexions Docker
- Verificat que el servidor arrenca i respon correctament

### 2026-02-17 – Auditoria d'estructura
- **Autor:** @chuclao (amb IA)
- Realitzada auditoria completa de l'estructura del servei
- Identificats punts pendents: connexió Redis (ioredis importat però no usat), handlers d'events, middleware d'autenticació, carpetes handlers/middleware/config/utils
- No s'han fet canvis funcionals — pendent d'implementació

---

## 📚 Documentació Relacionada

*   **Visió Global del Projecte:** [../doc/PROJECT_CONCEPT.md](../doc/PROJECT_CONCEPT.md)
*   **Backend (API):** [../api/CONTEXT.md](../api/CONTEXT.md)
*   **Frontend (Cliente):** [../client/CONTEXT.md](../client/CONTEXT.md)
