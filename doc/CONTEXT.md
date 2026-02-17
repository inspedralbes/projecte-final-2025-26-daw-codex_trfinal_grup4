# 📋 CONTEXT DEL PROJECTE – Registre de Canvis

> **Fitxer de context per a desenvolupadors i agents IA.**
> Conté un registre dels canvis realitzats, l'estat actual del projecte i informació útil per incorporar-se ràpidament.

---

## 🧑‍💻 Autor dels canvis inicials

- **Nom:** Izan De La Cruz
- **GitHub:** [@chuclao](https://github.com/chuclao)
- **Email:** a23izadelesp@inspedralbes.cat

## 👥 Equip complet

| Nom             | Rol            |
| --------------- | -------------- |
| Izan De La Cruz | Desenvolupador |
| Marc Rojano     | Desenvolupador |
| Iker Delgado    | Desenvolupador |
| Pol Díaz        | Desenvolupador |

## 📦 Repositori

- **URL:** https://github.com/inspedralbes/projecte-final-2025-26-daw-codex_trfinal_grup4
- **Organització:** inspedralbes
- **Branca principal de treball:** `dev`

---

## 📅 Registre de Canvis

### 2026-02-17 – 09:00 CET — Instal·lació Laravel i Esquema de Base de Dades

**Branca:** `dev`
**Autor:** Iker Delgado

#### Resum

S'ha instal·lat el framework Laravel complet dins del directori `/api` i s'ha implementat l'esquema de base de dades complet segons les especificacions del projecte (Centres, Usuaris, Posts, Comentaris, etc.).

#### Fitxers modificats/creats

##### API (Laravel)

| Fitxer                                                             | Descripció                                                                                              |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `api/database/migrations/2025_02_17_000000_create_full_schema.php` | Migració única que conté tota l'estructura de la base de dades (8 taules principals + taules pivot).    |
| `api/.env`                                                         | Configuració de connexió a BD i canvi de drivers de Sessió/Cache a `file` per simplificar dependencies. |
| `api/*`                                                            | Estructura estàndard de Laravel 11 instal·lada via Composer.                                            |

#### Decisions tècniques importants

1. **Migració Unificada:** S'ha optat per una única migració (`create_full_schema`) per agrupar la creació de totes les taules relacionades i facilitar la gestió de claus foranes i l'ordre de creació.
2. **Drivers de Sessió/Cache en fitxer:** S'han configurat `SESSION_DRIVER=file` i `CACHE_STORE=file` al `.env` per evitar dependències addicionals (Redis/Database) durant aquesta fase inicial de desenvolupament, assegurant que l'API funcioni immediatament amb la configuració bàsica.
3. **Neteja de migracions per defecte:** S'han eliminat les migracions per defecte de Laravel (`0001_01_01_...`) per evitar conflictes i tenir un esquema net definit pel nostre fitxer de schema complet.

#### Verificació

- **Instal·lació:** `laravel/framework` v11.x instal·lat correctament.
- **Base de Dades:** Migració executada amb èxit (`php artisan migrate:fresh`).
- **Taules creades:** `centers`, `users`, `follows`, `posts`, `comments`, `likes`, `bookmarks`, `tags`, `post_tag`, `tag_user`, `chat_messages`.

### 2026-02-13 – 10:20 CET — Infraestructura Docker completa

**Branca:** `dev`
**Autor:** @chuclao (Izan De La Cruz)

#### Resum

S'ha creat tota la infraestructura Docker del projecte des de zero, configurant dos entorns diferenciats (Desenvolupament i Producció) amb un stack de 4 serveis principals + eines de suport.

#### Fitxers creats

##### Dockerfiles (3)

| Fitxer              | Descripció                                                                                                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/Dockerfile`    | PHP 8.3-FPM Alpine, extensions (pdo_mysql, bcmath, redis, gd, zip, intl, mbstring, opcache), Composer 2, Xdebug (dev). Multi-stage: `development` i `production`. |
| `client/Dockerfile` | Node 20 Alpine. Multi-stage: `build` (npm ci + npm run build), `production` (fitxers estàtics), `development` (Vite dev server).                                  |
| `socket/Dockerfile` | Node 20 Alpine. Multi-stage: `production` (node index.js) i `development` (nodemon).                                                                              |

##### Docker Compose (2)

| Fitxer                    | Descripció                                                                                                                                                                         |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker-compose.dev.yml`  | 8 serveis: webserver, api, client, socket, mysql, redis, mailpit, adminer. Volums bind-mount per a desenvolupament en temps real. Ports: 8080, 5173, 3306, 6379, 8025, 1025, 8081. |
| `docker-compose.prod.yml` | 6 serveis: webserver, api, client (build), socket, mysql, redis. Sense bind-mounts, només port 80 exposat, restart always, Redis amb password.                                     |

##### Configuració Nginx (2)

| Fitxer                           | Descripció                                                                                                                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docker/nginx/default.dev.conf`  | Reverse proxy amb resolució DNS dinàmica (`resolver 127.0.0.11`). Proxy-pass: `/api` → PHP-FPM, `/socket.io` → Node:3000, `/` → Vite:5173 amb suport WebSocket HMR.                                                           |
| `docker/nginx/default.prod.conf` | Serveix estàtics React des de `/var/www/html/client/dist`. Proxy-pass API i Socket.io. Capçaleres de seguretat (X-Frame-Options, X-Content-Type-Options, CSP). Gzip activat. Caché d'actius 1 any. SPA fallback a index.html. |

##### Configuració PHP (2)

| Fitxer                    | Descripció                                                                    |
| ------------------------- | ----------------------------------------------------------------------------- |
| `docker/php/php.dev.ini`  | Errors visibles, OPcache OFF, Xdebug activat, memory_limit 512M, upload 100M. |
| `docker/php/php.prod.ini` | Errors ocults, OPcache ON (optimitzat), memory_limit 256M, cookies segures.   |

##### Configuració MySQL (2)

| Fitxer                  | Descripció                                                           |
| ----------------------- | -------------------------------------------------------------------- |
| `docker/mysql/init.sql` | Crea BD `tfg_database`, usuari `tfg_user`, BD testing `tfg_testing`. |
| `docker/mysql/my.cnf`   | utf8mb4, InnoDB optimitzat, slow query log, 200 max connections.     |

##### Variables d'entorn (2)

| Fitxer              | Descripció                                                                     |
| ------------------- | ------------------------------------------------------------------------------ |
| `.env.dev`          | Variables per a dev (DB, Redis, Mailpit, Vite). Valors per defecte funcionals. |
| `.env.prod.example` | Plantilla per a producció. ⚠️ Tots els secrets marcats com `CHANGE_ME`.        |

##### Scripts (1)

| Fitxer        | Descripció                                                                                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `init-dev.sh` | Script bash automatitzat: verifica Docker, copia .env, construeix imatges, aixeca contenidors, instal·la dependències (composer + npm), executa migracions, mostra resum de URLs. |

##### Fitxers placeholder (mínims per a test)

| Fitxer                  | Descripció                                               |
| ----------------------- | -------------------------------------------------------- |
| `api/composer.json`     | Placeholder amb dependència Laravel 11.                  |
| `api/public/index.php`  | Health check PHP que retorna JSON.                       |
| `api/.env`              | Variables Laravel apuntant als serveis Docker.           |
| `client/package.json`   | React 18 + Vite 5 amb scripts dev/build.                 |
| `client/vite.config.js` | Config Vite amb host 0.0.0.0, port 5173, polling.        |
| `client/index.html`     | HTML base amb `<div id="root">`.                         |
| `client/src/main.jsx`   | Component React mínim de test.                           |
| `socket/package.json`   | express, socket.io, ioredis, dotenv, cors, nodemon.      |
| `socket/index.js`       | Servidor Express + Socket.io amb health check `/health`. |
| `socket/.env`           | Variables Node apuntant a Redis Docker.                  |

##### Altres

| Fitxer                 | Descripció                                                   |
| ---------------------- | ------------------------------------------------------------ |
| `.gitignore`           | Ignora .env, node_modules, vendor, IDEs, logs.               |
| `api/.dockerignore`    | Exclou vendor, node_modules, tests, .env del context Docker. |
| `client/.dockerignore` | Exclou node_modules, dist, .env.                             |
| `socket/.dockerignore` | Exclou node_modules, .env.                                   |

#### Decisions tècniques importants

1. **Resolució DNS dinàmica a Nginx dev:** S'utilitza `resolver 127.0.0.11` amb variables a `proxy_pass`/`fastcgi_pass` per evitar que Nginx falli si un upstream no està llest al arrancar.
2. **Volums nombrats per a node_modules:** Es separen els `node_modules` en volums Docker per evitar conflictes amb el bind-mount del codi font.
3. **Multi-stage builds:** Cada Dockerfile té stages `development` i `production` per optimitzar la mida de les imatges.
4. **Client de producció com a servei "one-shot":** El contenidor `client` en prod s'executa una vegada, copia el build al volum compartit i finalitza (`restart: "no"`).

#### Verificació (tots els serveis testejats ✅)

```
1️⃣  Frontend (Nginx :8080)  → HTTP 200 ✅
2️⃣  Frontend (Vite :5173)   → HTTP 200 ✅
3️⃣  API (Nginx :8080/api)   → JSON ok  ✅
4️⃣  Socket.io (via Nginx)   → HTTP 200 ✅
5️⃣  Adminer (:8081)         → HTTP 200 ✅
6️⃣  Mailpit (:8025)         → HTTP 200 ✅
7️⃣  Redis                   → PONG     ✅
8️⃣  MySQL                   → alive    ✅
```

---

## 🗺️ Pròxims passos suggerits

- [ ] Instal·lar Laravel 11 complet dins `/api` (`composer create-project laravel/laravel .`)
- [ ] Configurar l'aplicació React real dins `/client`
- [ ] Definir models, migracions i endpoints de l'API
- [ ] Integrar autenticació (Laravel Sanctum / Passport)
- [ ] Implementar lògica de Socket.io amb Redis adapter
- [ ] Configurar CI/CD (GitHub Actions)
- [ ] Afegir certificat SSL (Let's Encrypt) per a producció
- [ ] Completar documentació d'endpoints API (Swagger/OpenAPI)
