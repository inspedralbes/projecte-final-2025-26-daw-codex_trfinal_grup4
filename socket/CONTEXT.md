# ⚡ CONTEXT – Real-time (Node.js + Socket.io)

> **Directrius i registre de canvis per a la carpeta `socket/`.**
> Llegeix SEMPRE aquest fitxer abans de treballar al servei de WebSockets.

---

## 📌 Informació del servei

| Camp                        | Valor                                        |
| --------------------------- | -------------------------------------------- |
| **Runtime**                 | Node.js 20 (Alpine)                          |
| **Framework HTTP**          | Express 4                                    |
| **WebSockets**              | Socket.io 4                                  |
| **Redis client**            | ioredis 5                                    |
| **Port**                    | 3000 (intern, no exposat)                    |
| **Accés**                   | `ws://localhost:8080/socket.io/` (via Nginx) |
| **Contenidor**              | `tfg_socket_dev`                             |
| **Directori al contenidor** | `/app`                                       |
| **Hot reload**              | nodemon (dev)                                |

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
     const Redis = require("ioredis");
     const subscriber = new Redis({
       host: process.env.REDIS_HOST,
       port: process.env.REDIS_PORT,
     });
     subscriber.subscribe("channel-name");
     subscriber.on("message", (channel, message) => {
       io.emit("event-name", JSON.parse(message));
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
   const chatNamespace = io.of("/chat");
   const gameNamespace = io.of("/game");
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

| Variable         | Valor (dev)             | Descripció                      |
| ---------------- | ----------------------- | ------------------------------- |
| `NODE_ENV`       | `development`           | Entorn                          |
| `PORT`           | `3000`                  | Port del servidor               |
| `REDIS_HOST`     | `redis`                 | Host Redis (nom del contenidor) |
| `REDIS_PORT`     | `6379`                  | Port Redis                      |
| `REDIS_PASSWORD` | _(buit)_                | Password Redis (buit en dev)    |
| `CORS_ORIGIN`    | `http://localhost:8080` | Origen permès per CORS          |

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

### 2026-02-19 – Integració Real-time amb Laravel Broadcasting

- **Autor:** @chuclao (amb IA)
- Reescrit **`index.js`** completament per integrar-se amb el broadcasting de Laravel via Redis:
  - **Redis Pub/Sub**: utilitza `psubscribe('tfg-database-*')` per capturar tots els canals que Laravel publica
  - **Parsing**: extreu el canal original (strip prefix `tfg-database-`) i el nom de l'event del payload JSON de Laravel
  - **Routing**: emet cada event a la room Socket.io corresponent (`user.{id}`, `post.{id}`)
- **Events del client Socket.io:**
  - `join` → `{ userId: N }` — El client s'uneix a la seva room personal `user.N` per rebre notificacions i interaccions
  - `join-post` → `{ postId: N }` — El client s'uneix a `post.N` per rebre comentaris en temps real
  - `leave-post` → `{ postId: N }` — El client abandona la room del post
- **Events emesos cap al client:**
  - `new.notification` — Notificació nova (like, follow, comment, reply, repost)
  - `new.interaction` — Interacció like/bookmark
  - `new.comment` — Comentari nou a un post
  - `post.deleted` — Publicació eliminada (Nou)
  - `interaction.removed` — Like o bookmark eliminat (Nou)
- **Health check millorat**: `GET /health` ara retorna `subscribedChannels` (llista de canals que han rebut missatges, útil per debugging)
- **Prefix Redis configurable**: via variable d'entorn `REDIS_PREFIX` (default: `tfg-database-`)
- **Flux complet:**
  ```
  Laravel (API)  ──PUBLISH──▶  Redis  ──pmessage──▶  Node (Socket.io)  ──emit──▶  React (Client)
       │                         │                        │                          │
   broadcast()            tfg-database-user.3      io.to('user.3')          on('new.notification')
  ```

### 2026-02-20 – Verificació Integració Frontend

- **Autor:** @copilot (IA)
- Verificat funcionament correcte de la integració Frontend ↔ Socket.io ↔ Laravel
- **Client Socket.io creat** a `client/src/services/socketService.js`:
  - Connexió automàtica amb autenticació via token (handshake.auth.token)
  - Mètodes: `connect()`, `disconnect()`, `joinUserRoom()`, `joinPost()`, `leavePost()`, `on()`, `off()`
- **Hook `useSocketAuth`**: gestiona connexió automàtica basada en estat d'autenticació
- Integrat als hooks d'aplicació per actualitzacions real-time

### 2026-02-23 – Temps real de perfil (Profile Rooms)

- **Autor:** @iker
- **Routing d'events de perfil:**
  - `index.js` actualitzat per escoltar events `ProfileUpdatedEvent` de Laravel (canals `profile.{id}`).
  - Els events es reenvien al client amb el nom `profile.updated`.
  - `join-profile` → `{ userId: N }` o `{ profileId: N }` — El client s'uneix a la room del perfil `profile.N`
  - `leave-profile` → `{ userId: N }` o `{ profileId: N }`
- **Payload `profile.updated`:** `user_id`, `name`, `avatar`, `bio`, `followers_count`, `following_count`.

### 2026-02-25 – Sincronització Real-Time d'Eliminacions (Broadcast)

- **Autor:** @iker
- **Noves entrades de broadcast (Laravel → Redis → Sockets):**
  - `post.deleted`: Sincronitza l'eliminació de posts en tots els feeds mundials i perfils d'usuari.
  - `interaction.removed`: Sincronitza la eliminació de likes/bookmarks per mantenir l'estat local del client sense refrescar.
- **Client Side**: `socketService.js` actualitzat amb el mètode genèric `.on()` per capturar aquests nous events.

### 2026-02-24 – Sincronització Real-Time d'Eliminacions (Broadcast)

- **Autor:** @iker
- **Noves entrades de broadcast (Laravel → Redis → Sockets):**
  - `post.deleted`: Sincronitza l'eliminació de posts en tots els feeds mundials i perfils d'usuari.
  - `interaction.removed`: Sincronitza la eliminació de likes/bookmarks per mantenir l'estat local del client sense refrescar.
- **Client Side**: `socketService.js` actualitzat amb el mètode genèric `.on()` per capturar aquests nous events.

### 2026-02-25 – Sistema de Xat Real-Time

- **Autor:** @copilot (IA)
- **Nous Events Socket.io:**
  - `join-chat`: Client s'uneix a una sala de xat (`{ recipientId: N }`). Sala creada amb IDs ordenats.
  - `leave-chat`: Client deixa la sala de xat.
  - `typing`: Indicador de tecleig a la conversa.
- **Broadcast Events (Laravel → Redis → Socket.io):**
  - `new.message`: Nou missatge rebut (payload: message object complet).
  - `messages.read`: Missatges marcats com llegits (payload: conversation_user_id, read_by_id).
- **Room Naming Convention:**
  - Sales de xat: `chat.{minId}.{maxId}` (IDs ordenats per consistència).
  - Exemple: conversa entre usuaris 5 i 12 → `chat.5.12`.
### 2026-02-26 – Sistema de Xat P2P (Peer-to-Peer)

- **Autor:** @copilot (IA)
- **Nous Events Socket.io (P2P):**
  - `send-message`: Client envia missatge directament via socket (`{ receiverId, content, tempId, token }`).
    - El socket valida i persisteix el missatge cridant l'API internament.
    - Emet `new.message` a la room del xat amb `tempId` per actualització optimista.
    - Retorna callback amb `{ success, message, error }`.
  - `mark-read`: Client marca missatges com llegits via socket (`{ partnerId, userId, token }`).
    - El socket crida l'API per persistir i emet `messages.read` a la room.
- **Avantatges P2P:**
  - Latència reduïda: missatge arriba immediatament sense esperar resposta HTTP.
  - Actualització optimista: UI s'actualitza abans de confirmació del servidor.
  - Gestió de duplicats: `tempId` identifica missatges temporals per substituir amb l'`id` real.
---

## 📚 Documentació Relacionada

- **Visió Global del Projecte:** [../doc/PROJECT_CONCEPT.md](../doc/PROJECT_CONCEPT.md)
- **Backend (API):** [../api/CONTEXT.md](../api/CONTEXT.md)
- **Frontend (Cliente):** [../client/CONTEXT.md](../client/CONTEXT.md)
