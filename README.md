# 🎓 Projecte Final DAW – Codex TRFinal Grup 4

## 👥 Integrants
| Nom | GitHub |
|---|---|
| Izan De La Cruz | [@chuclao](https://github.com/chuclao) |
| Marc Rojano | - |
| Iker Delgado | - |
| Pol Díaz | - |

## 📋 Descripció
Projecte final del cicle DAW (Desenvolupament d'Aplicacions Web) – Curs 2025-26.
Aplicació web full-stack amb arquitectura de microserveis containeritzada amb Docker.

## 🛠️ Stack Tecnològic
- **Backend:** Laravel 11 (PHP 8.3-FPM) + Nginx
- **Frontend:** React (JS) + Vite
- **Real-time:** Node.js + Socket.io + Redis
- **Base de dades:** MySQL 8.0
- **Infraestructura:** Docker + Docker Compose (Dev & Prod)

## 📁 Estructura del Projecte
```
/
├── api/                    # Backend – Laravel 11
├── client/                 # Frontend – React + Vite
├── socket/                 # Real-time – Node.js + Socket.io
├── docker/
│   ├── nginx/              # Configuracions Nginx (dev & prod)
│   ├── php/                # Configuracions PHP (dev & prod)
│   └── mysql/              # Init scripts i configuració MySQL
├── doc/                    # Documentació del projecte
├── docker-compose.dev.yml  # Orquestració – Desenvolupament
├── docker-compose.prod.yml # Orquestració – Producció
├── init-dev.sh             # Script d'inicialització dev
├── .env.dev                # Variables d'entorn dev
└── .env.prod.example       # Plantilla variables prod
```

## 🚀 Posar en marxa (Desenvolupament)

### Requisits
- Docker >= 24.0
- Docker Compose >= 2.20

### Instal·lació ràpida
```bash
git clone https://github.com/inspedralbes/projecte-final-2025-26-daw-codex_trfinal_grup4.git
cd projecte-final-2025-26-daw-codex_trfinal_grup4
git checkout dev
chmod +x init-dev.sh && ./init-dev.sh
```

### Instal·lació manual
```bash
# 1. Copiar variables d'entorn
cp .env.dev .env

# 2. Construir i aixecar contenidors
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d

# 3. Instal·lar dependències (en contenidors temporals)
docker run --rm -v "$(pwd)/client:/app" -v "$(docker volume ls -q | grep client_node_modules):/app/node_modules" -w /app node:20-alpine npm install
docker run --rm -v "$(pwd)/socket:/app" -v "$(docker volume ls -q | grep socket_node_modules):/app/node_modules" -w /app node:20-alpine npm install

# 4. Reiniciar serveis
docker compose -f docker-compose.dev.yml restart
```

### 🌐 Serveis disponibles (Dev)
| Servei | URL | Descripció |
|---|---|---|
| Frontend | http://localhost:8080 | App React via Nginx |
| Vite (directe) | http://localhost:5173 | Dev server amb HMR |
| API | http://localhost:8080/api | Laravel via Nginx |
| Socket.io | ws://localhost:8080/socket.io | WebSockets via Nginx |
| Adminer | http://localhost:8081 | Gestor BD web |
| Mailpit | http://localhost:8025 | Servidor de correu dev |
| MySQL | localhost:3306 | Base de dades |
| Redis | localhost:6379 | Caché / Pub-Sub |

## 🏭 Desplegament a Producció

### Requisits
- Servidor Linux (Ubuntu 20.04+, Debian 10+, AlmaLinux 9+)
- Docker >= 24.0
- Docker Compose >= 2.20
- Domini apuntant als servidors (DNS configurat)
- Port 80 i 443 accessibles

### Instal·lació ràpida (VPS/Servidor)

```bash
# 1. Clonar repositori
git clone https://github.com/inspedralbes/projecte-final-2025-26-daw-codex_trfinal_grup4.git
cd projecte-final-2025-26-daw-codex_trfinal_grup4
git checkout main

# 2. Copiar i editar variables d'entorn
cp .env.prod.example .env

# 3. IMPORTANT: Editar .env amb credencials SEGURES
#    - Generar APP_KEY: php artisan key:generate (o generar base64 manual)
#    - Definir DOMAIN=tu-dominio.com
#    - Cambiar contrasenya BD, Redis, Mail
#    - Afegir credencials Google OAuth
nano .env

# 4. Construir i aixecar contenidors
docker compose -f docker-compose.prod.yml up --build -d

# 5. Generar certificat SSL (Let's Encrypt via Certbot)
docker compose -f docker-compose.prod.yml exec -T certbot certbot certonly \
  --webroot -w /var/www/certbot \
  -d tu-dominio.com

# 6. Executar migracions (una sola vegada)
docker compose -f docker-compose.prod.yml exec -T api php artisan migrate --force
docker compose -f docker-compose.prod.yml exec -T api php artisan db:seed --force

# 7. Reiniciar Nginx per carregar certificats
docker compose -f docker-compose.prod.yml restart webserver

# 8. Verificar (accedir a https://tu-dominio.com)
```

### Checklist Pre-Producció ✅

- [ ] Certificat SSL generat (`/etc/letsencrypt/live/tu-dominio.com/`)
- [ ] `.env` amb credencials segures (no clonar de dev)
- [ ] `DOMAIN` variable configurada correctament
- [ ] Google OAuth credentials actualitzades amb URL de producció
- [ ] Database backups configurats
- [ ] Logs monitorizats
- [ ] Firewall configurat (només ports 80, 443, SSH)
- [ ] Email SMTP funcional

### Renovació de Certificat SSL

```bash
# Manualll
docker compose -f docker-compose.prod.yml exec -T certbot certbot renew

# Automàtic (cron job cada mes)
0 0 1 * * cd /path/to/project && docker compose -f docker-compose.prod.yml exec -T certbot certbot renew
```

### Monitorització & Manteniment

```bash
# Veure logs
docker compose -f docker-compose.prod.yml logs -f

# Backup de BD
docker compose -f docker-compose.prod.yml exec -T mysql mysqldump -u root -p${DB_ROOT_PASSWORD} ${DB_DATABASE} > backup.sql

# Restaurar BD
docker compose -f docker-compose.prod.yml exec -T mysql mysql -u root -p${DB_ROOT_PASSWORD} ${DB_DATABASE} < backup.sql
```

### URL de Producció
- 🌐 **App:** https://tu-dominio.com
- 📡 **API:** https://tu-dominio.com/api
- 💬 **Socket.io:** wss://tu-dominio.com/socket.io/
- 🔒 **SSL:** Let's Encrypt (automàtic)


