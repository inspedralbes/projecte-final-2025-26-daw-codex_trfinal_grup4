# Projecte Final DAW – Codex TRFinal Grup 4

## Integrants
| Nom | GitHub |
|---|---|
| Izan De La Cruz | [@chuclao](https://github.com/chuclao) |
| Marc Rojano | - |
| Iker Delgado | - |
| Pol Díaz | - |

## Documentació del Projecte

### Per a Usuaris (Instal·lació i Ús)
- **[Manual de Instal·lació](./doc/MANUAL_INSTALACION.md)** – Guia completa per instal·lar i posar en marxa el projecte
- **[Pitch del Projecte (PDF)](./doc/pitch_2526_Codex.pdf)** – Presentació dels objectius i característiques
- **[Demo del Projecte (PDF)](./doc/demo_2526_Codex.pdf)** – Demostració funcional del projecte

### Per a Desenvolupadors
- **[Documentació Tècnica General](./doc/README.md)** – Guia tècnica del projecte
- **[Arquitectura del Projecte](./doc/ARCHITECTURE.md)** – Descripció de la infraestructura i components
- **[API Reference](./doc/API.md)** – Documentació de endpoints API
- **[Frontend](./doc/FRONTEND.md)** – Guia de desenvolupament frontend
- **[Backend](./doc/BACKEND.md)** – Detalls del backend Laravel
- **[Socket.io](./doc/SOCKET.md)** – Sistema de temps real i WebSockets
- **[Docker](./doc/DOCKER.md)** – Configuració de contenidors
- **[Moderació IA](./doc/AI_MODERATION.md)** – Sistema de moderació amb Intel·ligència Artificial
- **[Guia de Contribució](./doc/CONTRIBUTING.md)** – Normes per contribuir al projecte

## 📋 Descripció

Codex és una plataforma social col·laborativa per a estudiants de centres educatius. Permet crear publicacions, seguir altres usuaris, comunicar-se en temps real, fer videollamades i col·laborar en grups de treball.

### Característiques Principals
- ✅ Autenticació de usuaris (registre i inici de sessió)
- ✅ Feed social amb publicacions i comentaris
- ✅ Missatgeria en temps real amb WebSockets
- ✅ Videollamades entre usuaris (WebRTC)
- ✅ Hubs per centre educatiu
- ✅ Sistema de grups col·laboratius
- ✅ Suport multiidioma (castellà, català, anglès)
- ✅ Tema fosc per defecte
- ✅ Interfície responsiva (escriptori i mòbil)
- ✅ Sistema de moderació amb Intel·ligència Artificial

## 🛠️ Stack Tecnològic
- **Backend:** Laravel 11 (PHP 8.3-FPM) + Nginx
- **Frontend:** React 18 (JavaScript) + Vite
- **Temps Real:** Node.js + Socket.io + WebRTC
- **Caché & Pub/Sub:** Redis
- **Base de Dades:** MySQL 8.0
- **Moderació IA:** Node.js + API d'IA (Groq)
- **Infraestructura:** Docker + Docker Compose (Desenvolupament & Producció)
- **Control de Versions:** Git + GitHub
- **Build Tool:** Vite (Frontend) + Composer (Backend)

## 📁 Estructura del Projecte
```
/
├── api/                           # Backend – Laravel 11 (API REST)
├── client/                        # Frontend – React 18 + Vite
├── socket/                        # Servidor temps real – Node.js + Socket.io
├── ai-moderation/                 # Microservei moderació IA – Node.js
├── docker/
│   ├── nginx/                     # Configuracions Nginx (dev & prod)
│   ├── php/                       # Configuracions PHP (dev & prod)
│   ├── mysql/                     # Init scripts i configuració MySQL
│   └── turn/                      # Servidor TURN per a WebRTC
├── doc/                           # Documentació completa del projecte
│   ├── MANUAL_INSTALACION.md      # Guia instal·lació i ús
│   ├── ARCHITECTURE.md            # Arquitectura tècnica
│   ├── API.md                     # API Reference
│   ├── FRONTEND.md                # Guia frontend
│   ├── BACKEND.md                 # Guia backend
│   ├── SOCKET.md                  # Sistema temps real
│   ├── DOCKER.md                  # Configuració Docker
│   ├── AI_MODERATION.md           # Sistema moderació IA
│   ├── CONTRIBUTING.md            # Guia de contribució
│   ├── pitch_2526_Codex.pdf       # Pitch del projecte
│   ├── demo_2526_Codex.pdf        # Demo del projecte
│   └── mockups/                   # Mockups d'interfície
├── docker-compose.dev.yml         # Orquestració – Desenvolupament
├── docker-compose.prod.yml        # Orquestració – Producció
├── init-dev.sh                    # Script inicialització dev
├── init-ssl.sh                    # Script SSL/certificats
├── .env.dev                       # Variables entorn dev
└── .env.prod.example              # Plantilla variables prod
```

## 🚀 Posar en Marxa (Desenvolupament)

### Requisits
- Docker >= 24.0
- Docker Compose >= 2.20
- Git
- Navegador modern (Chrome, Firefox, Safari, Edge)

### Instal·lació Ràpida (Recomanat)
```bash
git clone https://github.com/inspedralbes/projecte-final-2025-26-daw-codex_trfinal_grup4.git
cd projecte-final-2025-26-daw-codex_trfinal_grup4
git checkout dev
chmod +x init-dev.sh && ./init-dev.sh
```

Això farà:
- Clonar el repositori
- Canviar a branca `dev`
- Copiar fitxers `.env` necesaris
- Construir imatges Docker
- Descarregar dependències (npm, composer)
- Executar migracions de BD
- Aixecar tots els serveis

> **Nota:** Per a una guia més detallada amb explicacions completes, consulta el **[Manual de Instal·lació](./doc/MANUAL_INSTALACION.md)**.

### Instal·lació Manual (Pas a Pas)
```bash
# 1. Clonar repositori
git clone https://github.com/inspedralbes/projecte-final-2025-26-daw-codex_trfinal_grup4.git
cd projecte-final-2025-26-daw-codex_trfinal_grup4
git checkout dev

# 2. Copiar variables d'entorn
cp .env.dev .env

# 3. Construir i aixecar contenidors
docker compose -f docker-compose.dev.yml build
docker compose -f docker-compose.dev.yml up -d

# 4. Instal·lar dependències de Frontend
docker compose -f docker-compose.dev.yml exec client npm install

# 5. Instal·lar dependències de Socket.io
docker compose -f docker-compose.dev.yml exec socket npm install

# 6. Executar migracions de BD
docker compose -f docker-compose.dev.yml exec api php artisan migrate

# 7. Carregar seed (dades inicials)
docker compose -f docker-compose.dev.yml exec api php artisan db:seed

# 8. Reiniciar serveis
docker compose -f docker-compose.dev.yml restart
```

### Serveis Disponibles (Desenvolupament)
| Servei | URL | Descripció |
|---|---|---|
| **Frontend** | http://localhost:8080 | App React completa |
| **API** | http://localhost:8080/api | API REST Laravel |
| **Socket.io** | ws://localhost:8080/socket.io | WebSockets temps real |
| **Adminer** | http://localhost:8081 | Gestor BD web |
| **Mailpit** | http://localhost:8025 | Servidor correu dev |
| **MySQL** | localhost:3306 | Base de dades (root/secret) |
| **Redis** | localhost:6379 | Caché / Pub-Sub |

### Verificar que Funciona

```bash
# 1. Comprovar que tots els contenidors estan en marxa
docker compose -f docker-compose.dev.yml ps

# 2. Veure logs
docker compose -f docker-compose.dev.yml logs -f

# 3. Accedir a l'aplicació
# Obrir navegador i anar a http://localhost:8080
# Credencials test: demo@example.com / password123

# 4. Provar API
curl http://localhost:8080/api/auth/user

# 5. Provar Socket.io
# A través de la consola del navegador
```

### Detencions de Serveis

```bash
# Aturar tots els contenidors (mantenint dades)
docker compose -f docker-compose.dev.yml stop

# Tornar a aixecar
docker compose -f docker-compose.dev.yml start

# Eliminar tots els contenidors (ATENCIÓ: perd dades)
docker compose -f docker-compose.dev.yml down

# Eliminar contenidors + volums (ATENCIÓ: perd tot)
docker compose -f docker-compose.dev.yml down -v
```

## 🏭 Desplegament a Producció

### Requisits Pre-Desplegament
- Servidor Linux (Ubuntu 20.04+, Debian 11+, AlmaLinux 9+)
- Docker >= 24.0 i Docker Compose >= 2.20
- Domini apuntant als servidors (DNS configurat)
- Ports 80 i 443 accessibles (no bloquejats per firewall)
- Mínimo 2GB RAM i 10GB espai disc
- Certificat SSL (obtingut via Let's Encrypt)

### Instal·lació Ràpida (VPS/Servidor)

```bash
# 1. Clonar repositori (branca main)
git clone https://github.com/inspedralbes/projecte-final-2025-26-daw-codex_trfinal_grup4.git
cd projecte-final-2025-26-daw-codex_trfinal_grup4
git checkout main

# 2. Copiar i configurar variables d'entorn
cp .env.prod.example .env

# 3. IMPORTANT: Editar .env amb credencials segures
#    - DOMAIN: el vostre domini (ex: codex.example.com)
#    - DB_PASSWORD: contrasenya aleatòria forta
#    - REDIS_PASSWORD: contrasenya aleatòria forta
#    - APP_KEY: generar amb: php artisan key:generate
#    - OAuth credentials (Google, Microsoft, etc.)
nano .env

# 4. Generar certificat SSL (Let's Encrypt)
chmod +x init-ssl.sh && ./init-ssl.sh

# 5. Construir i aixecar contenidors
docker compose -f docker-compose.prod.yml up --build -d

# 6. Executar migracions (UNA SOLA VEGADA)
docker compose -f docker-compose.prod.yml exec -T api php artisan migrate --force
docker compose -f docker-compose.prod.yml exec -T api php artisan db:seed --force

# 7. Verificar que funciona
# Accedir a https://vostre-dominio.com
```

### Checklist Pre-Producció ✅

- [ ] Servidor Linux preparat (Ubuntu 20.04+, Debian 11+)
- [ ] Docker i Docker Compose instal·lats
- [ ] Domini apuntant correctament als servidors
- [ ] Ports 80 i 443 accessibles
- [ ] Fitxer `.env` configurat amb credencials segures
- [ ] Certificat SSL generat correctament
- [ ] Migracions de BD executades (`php artisan migrate --force`)
- [ ] Seeds de BD carregats (dades inicials)
- [ ] Credencials OAuth actualitzades per a producció
- [ ] Backups de BD configurats
- [ ] Firewall configurat (només ports 80, 443, SSH)
- [ ] Email SMTP funcional
- [ ] Logs monitorizats i configurats
- [ ] CORS i CSRF configurats correctament

### Monitorització & Manteniment

```bash
# Veure logs de tots els serveis
docker compose -f docker-compose.prod.yml logs -f

# Veure logs d'un servei específic
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f socket

# Backup de BD
docker compose -f docker-compose.prod.yml exec -T mysql mysqldump \
  -u root -p${DB_ROOT_PASSWORD} ${DB_DATABASE} > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar BD des de backup
docker compose -f docker-compose.prod.yml exec -T mysql mysql \
  -u root -p${DB_ROOT_PASSWORD} ${DB_DATABASE} < backup_YYYYMMDD_HHMMSS.sql

# Reiniciar un servei (sense perdre dades)
docker compose -f docker-compose.prod.yml restart api
docker compose -f docker-compose.prod.yml restart socket
docker compose -f docker-compose.prod.yml restart webserver

# Veure ús de recursos
docker stats
```

### Renovació de Certificat SSL

```bash
# Renovació manual
docker compose -f docker-compose.prod.yml exec -T certbot certbot renew

# Automatitzar renovació (cron - cada 1 de cada mes)
0 0 1 * * cd /path/to/projecte && docker compose -f docker-compose.prod.yml exec -T certbot certbot renew
```

### URLs de Producció
- 🌐 **App:** https://vostre-dominio.com
- 📡 **API:** https://vostre-dominio.com/api
- 💬 **Socket.io:** wss://vostre-dominio.com/socket.io/
- 🔒 **SSL:** Let's Encrypt (automàtic)

---

## 🤝 Contribució

Per a contribuir al projecte, consulta la **[Guia de Contribució](./doc/CONTRIBUTING.md)**.

Els passos bàsics són:
1. Fork del repositori
2. Crear branca feature (`git checkout -b feature/nova-caracteristica`)
3. Commit dels canvis (`git commit -am 'Afegir nova caracteristica'`)
4. Push a la branca (`git push origin feature/nova-caracteristica`)
5. Obrir Pull Request

---

## 📞 Suport

### Obtenir Ajuda

1. **Manual d'Instal·lació:** Consulta el **[Manual de Instal·lació](./doc/MANUAL_INSTALACION.md)** per problemes comuns i solucions
2. **Documentació Tècnica:** Revisa la **[Documentació Tècnica](./doc/README.md)** per a preguntes sobre arquitectura
3. **Issues de GitHub:** Abre un issue si encuentras algun bug

### Errors Comuns i Solucions

| Error | Solució |
|---|---|
| `docker: command not found` | Instal·lar Docker des de https://docs.docker.com/get-docker/ |
| `permission denied while trying to connect to Docker daemon` | Afegir usuari al grup docker: `sudo usermod -aG docker $USER` |
| `port 80 is already allocated` | Canviar ports en `docker-compose.dev.yml` o aturar altri serveis |
| `npm ERR! code ERESOLVE` | Esborrar `node_modules` i `package-lock.json`, reintentar |
| `Connection refused on localhost:3306` | Esperar a que MySQL s'iniciï (pot tardar 10-30 segundos) |

Per a més solucions detallades, veure la **[Secció de Solucions del Manual](./doc/MANUAL_INSTALACION.md#solucionar-problemas-comunes)**.

---

## 📊 Estat del Projecte

- ✅ Autenticació d'usuaris
- ✅ Feed social
- ✅ Mensatgeria en temps real
- ✅ Videollamades (WebRTC)
- ✅ Grups col·laboratius
- ✅ Multiidioma
- ✅ Sistema de moderació IA
- ✅ Desplegament Docker
- 🔄 Millores de performance (en desenvolupament)
- 🔄 Analítiques avançades (planejat)

---

## 📝 Llicència

Aquest projecte està sota llicència **MIT**. Veure el fitxer **[LICENSE](./LICENSE)** per a més detalls.

---

## 🏫 Context Educatiu

Aquest és un **Projecte Final del Cicle DAW (Desenvolupament d'Aplicacions Web)** – Curs 2025-26, realitzat per estudiants de **l'Institut Pedralbes**.

**Centre:** Institut Pedralbes  
**Cicle:** DAW (Desenvolupament d'Aplicacions Web)  
**Curs:** 2025-26  
**Grup:** 4

---

**Última actualització:** 19 de maig de 2026


