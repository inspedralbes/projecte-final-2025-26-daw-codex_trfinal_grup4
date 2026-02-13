# 📚 Documentació del Projecte

## 👥 Equip de Desenvolupament
| Nom | Rol |
|---|---|
| Izan De La Cruz | Desenvolupador |
| Marc Rojano | Desenvolupador |
| Iker Delgado | Desenvolupador |
| Pol Díaz | Desenvolupador |

---

## 🎯 Objectius
Desenvolupar una aplicació web completa com a projecte final del cicle DAW, aplicant coneixements de frontend, backend, bases de dades i desplegament.

---

## 🏗️ Arquitectura

### Diagrama de components
```
                    ┌─────────────────────────────────┐
                    │           NGINX (80)            │
                    │        Reverse Proxy            │
                    └──────┬──────┬──────┬────────────┘
                           │      │      │
              ┌────────────┘      │      └────────────┐
              ▼                   ▼                   ▼
   ┌──────────────────┐ ┌────────────────┐ ┌──────────────────┐
   │  React + Vite    │ │ Laravel 11     │ │ Node.js          │
   │  Frontend (:5173)│ │ API (:9000)    │ │ Socket.io (:3000)│
   └──────────────────┘ └───────┬────────┘ └────────┬─────────┘
                                │                   │
                     ┌──────────┴───────┐           │
                     ▼                  ▼           ▼
              ┌────────────┐    ┌─────────────────────┐
              │ MySQL 8.0  │    │    Redis 7           │
              │  (:3306)   │    │ Cache/PubSub (:6379) │
              └────────────┘    └─────────────────────┘
```

### Tecnologies utilitzades
| Capa | Tecnologia | Versió |
|---|---|---|
| Frontend | React + Vite | React 18 / Vite 5 |
| Backend | Laravel (PHP-FPM) | Laravel 11 / PHP 8.3 |
| Real-time | Node.js + Socket.io | Node 20 / Socket.io 4 |
| Base de dades | MySQL | 8.0 |
| Caché / PubSub | Redis | 7 (Alpine) |
| Reverse Proxy | Nginx | 1.25 (Alpine) |
| Contenidors | Docker + Docker Compose | v2 |

### Interrelació entre components
- **Nginx** actua com a punt d'entrada únic, fent de reverse proxy cap a tots els serveis.
- **React** consumeix l'API REST de Laravel i es connecta als WebSockets de Socket.io.
- **Laravel** gestiona la lògica de negoci, autenticació i accés a MySQL. Utilitza Redis per a caché, sessions i cues.
- **Socket.io** proporciona comunicació en temps real i utilitza Redis com a adaptador per a Pub/Sub.
- **MySQL** emmagatzema les dades persistents de l'aplicació.
- **Redis** serveix com a capa compartida entre Laravel i Socket.io.

---

## 💻 Entorn de Desenvolupament

### Requisits previs
- Docker >= 24.0
- Docker Compose >= 2.20
- Git

### Instal·lació
```bash
# Clonar el repositori
git clone https://github.com/inspedralbes/projecte-final-2025-26-daw-codex_trfinal_grup4.git
cd projecte-final-2025-26-daw-codex_trfinal_grup4

# Canviar a la branca dev
git checkout dev

# Executar l'script d'inicialització
chmod +x init-dev.sh
./init-dev.sh
```

### Serveis i ports (Desenvolupament)
| Servei | Port | URL |
|---|---|---|
| Frontend (via Nginx) | 8080 | http://localhost:8080 |
| Vite Dev Server | 5173 | http://localhost:5173 |
| API Laravel (via Nginx) | 8080 | http://localhost:8080/api |
| Socket.io (via Nginx) | 8080 | ws://localhost:8080/socket.io |
| MySQL | 3306 | localhost:3306 |
| Redis | 6379 | localhost:6379 |
| Adminer | 8081 | http://localhost:8081 |
| Mailpit (Web) | 8025 | http://localhost:8025 |
| Mailpit (SMTP) | 1025 | localhost:1025 |

### Credencials de desenvolupament
| Servei | Usuari | Contrasenya |
|---|---|---|
| MySQL (root) | root | rootpassword |
| MySQL (app) | tfg_user | tfg_password |
| Base de dades | tfg_database | - |

### Comandes útils
```bash
# Aixecar l'entorn
docker compose -f docker-compose.dev.yml up -d

# Veure logs
docker compose -f docker-compose.dev.yml logs -f

# Parar l'entorn
docker compose -f docker-compose.dev.yml down

# Executar comandes Laravel (Artisan)
docker compose -f docker-compose.dev.yml exec api php artisan <comanda>

# Accedir a MySQL
docker compose -f docker-compose.dev.yml exec mysql mysql -u tfg_user -p

# Reconstruir imatges
docker compose -f docker-compose.dev.yml up --build -d
```

---

## 🏭 Desplegament a Producció

### Estratègia
- Imatges Docker construïdes amb `COPY` (sense volums de codi).
- Només s'exposa el port **80** (Nginx).
- MySQL, Redis i Socket.io tancats a la xarxa interna `tfg_network`.
- React es compila (`npm run build`) i Nginx serveix els fitxers estàtics.
- Restart policy: `always`.

### Passos
```bash
# 1. Configurar variables d'entorn
cp .env.prod.example .env
# ⚠️ EDITAR .env amb contrasenyes segures!

# 2. Construir i desplegar
docker compose -f docker-compose.prod.yml up --build -d

# 3. Verificar
docker compose -f docker-compose.prod.yml ps
```

### Ports exposats (Producció)
| Servei | Port |
|---|---|
| Nginx | 80 |
| *Resta de serveis* | Xarxa interna |

---

## 📡 Endpoints de l'API (Pendent)
> Aquesta secció s'actualitzarà quan es desenvolupi l'API de Laravel.

### Format previst
```
GET    /api/v1/resource        → Llistar recursos
POST   /api/v1/resource        → Crear recurs
GET    /api/v1/resource/{id}   → Obtenir recurs
PUT    /api/v1/resource/{id}   → Actualitzar recurs
DELETE /api/v1/resource/{id}   → Eliminar recurs
```

### Exemple de resposta (JSON)
```json
{
  "status": "ok",
  "data": { },
  "message": "Operació completada"
}
```

---

## 📂 Estructura de fitxers Docker
```
docker/
├── nginx/
│   ├── default.dev.conf    # Nginx dev: proxy Vite HMR + API + Socket.io
│   └── default.prod.conf   # Nginx prod: estàtics + API + Socket.io + seguretat
├── php/
│   ├── php.dev.ini         # PHP dev: Xdebug, errors visibles, OPcache OFF
│   └── php.prod.ini        # PHP prod: OPcache ON, errors ocults
└── mysql/
    ├── init.sql            # Script inicialització BD + usuari
    └── my.cnf              # Configuració MySQL optimitzada
```
