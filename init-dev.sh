#!/usr/bin/env bash
# =============================================================
#  init-dev.sh – Inicialización del entorno de DESARROLLO
#  Uso: chmod +x init-dev.sh && ./init-dev.sh
# =============================================================

set -euo pipefail

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ---------------------------------------------------------
#  Funciones auxiliares
# ---------------------------------------------------------
log_info()    { echo -e "${BLUE}[INFO]${NC}    $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}      $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC}    $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC}   $1"; }

divider() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# ---------------------------------------------------------
#  1. Verificar requisitos
# ---------------------------------------------------------
divider "1/7 · Verificando requisitos"

command -v docker >/dev/null 2>&1 || { log_error "Docker no está instalado. Abortando."; exit 1; }
command -v docker compose >/dev/null 2>&1 || { log_error "Docker Compose (v2) no está instalado. Abortando."; exit 1; }

DOCKER_VERSION=$(docker --version)
COMPOSE_VERSION=$(docker compose version)
log_success "Docker: $DOCKER_VERSION"
log_success "Compose: $COMPOSE_VERSION"

# ---------------------------------------------------------
#  2. Configurar variables de entorno
# ---------------------------------------------------------
divider "2/7 · Configurando variables de entorno"

if [ ! -f .env ]; then
    cp .env.dev .env
    log_success "Archivo .env creado desde .env.dev"
else
    log_warn "Archivo .env ya existe – no se sobreescribe"
fi

# Crear .env para Laravel si no existe
if [ -d api ] && [ ! -f api/.env ]; then
    cat > api/.env <<'LARAVEL_ENV'
APP_NAME=TFG
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost:8080

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=tfg_database
DB_USERNAME=tfg_user
DB_PASSWORD=tfg_password

BROADCAST_DRIVER=redis
CACHE_DRIVER=redis
QUEUE_CONNECTION=redis
SESSION_DRIVER=redis

REDIS_HOST=redis
REDIS_PASSWORD=null
REDIS_PORT=6379

MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="no-reply@tfg.local"
MAIL_FROM_NAME="${APP_NAME}"
LARAVEL_ENV
    log_success "Archivo api/.env creado"
else
    log_warn "api/.env ya existe o directorio api/ no encontrado"
fi

# Crear .env para Socket si no existe
if [ -d socket ] && [ ! -f socket/.env ]; then
    cat > socket/.env <<'SOCKET_ENV'
NODE_ENV=development
PORT=3000
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
CORS_ORIGIN=http://localhost:8080
SOCKET_ENV
    log_success "Archivo socket/.env creado"
else
    log_warn "socket/.env ya existe o directorio socket/ no encontrado"
fi

# ---------------------------------------------------------
#  3. Construir imágenes
# ---------------------------------------------------------
divider "3/7 · Construyendo imágenes Docker"

docker compose -f docker-compose.dev.yml build
log_success "Imágenes construidas correctamente"

# ---------------------------------------------------------
#  4. Levantar contenedores
# ---------------------------------------------------------
divider "4/7 · Levantando contenedores"

docker compose -f docker-compose.dev.yml up -d
log_success "Contenedores en ejecución"

# ---------------------------------------------------------
#  5. Instalar dependencias
# ---------------------------------------------------------
divider "5/7 · Instalando dependencias"

# Laravel – Composer
log_info "Instalando dependencias de Laravel (composer install)..."
docker compose -f docker-compose.dev.yml exec -u "$(id -u):$(id -g)" -T api composer install --no-interaction --prefer-dist
log_success "Dependencias de Laravel instaladas"

# Laravel – App Key
log_info "Generando APP_KEY de Laravel..."
docker compose -f docker-compose.dev.yml exec -u "$(id -u):$(id -g)" -T api php artisan key:generate --force 2>/dev/null || log_warn "No se pudo generar APP_KEY (¿Laravel no está configurado?)"

# React – npm
log_info "Instalando dependencias de React (npm install)..."
docker compose -f docker-compose.dev.yml exec -T client npm install
log_success "Dependencias de React instaladas"

# Socket – npm
log_info "Instalando dependencias de Socket.io (npm install)..."
docker compose -f docker-compose.dev.yml exec -T socket npm install
log_success "Dependencias de Socket.io instaladas"

# ---------------------------------------------------------
#  6. Migraciones y Seeds
# ---------------------------------------------------------
divider "6/7 · Base de datos"

log_info "Esperando a que MySQL esté listo..."
sleep 5

log_info "Ejecutando migraciones de Laravel..."
docker compose -f docker-compose.dev.yml exec -u "$(id -u):$(id -g)" -T api php artisan migrate --force 2>/dev/null || log_warn "No se pudieron ejecutar migraciones (¿Laravel no está configurado?)"

log_info "Ejecutando seeders..."
docker compose -f docker-compose.dev.yml exec -u "$(id -u):$(id -g)" -T api php artisan db:seed 2>/dev/null || log_warn "No se pudieron ejecutar seeders"

# ---------------------------------------------------------
#  7. Resumen final
# ---------------------------------------------------------
divider "7/7 · ¡Entorno listo!"

echo ""
echo -e "  ${GREEN}✅ Entorno de desarrollo inicializado correctamente${NC}"
echo ""
echo -e "  ${BLUE}🌐 Servicios disponibles:${NC}"
echo -e "     ├── Frontend (Vite):   ${GREEN}http://localhost:8080${NC}"
echo -e "     ├── API (Laravel):     ${GREEN}http://localhost:8080/api${NC}"
echo -e "     ├── Vite directo:      ${GREEN}http://localhost:5173${NC}"
echo -e "     ├── Adminer:           ${GREEN}http://localhost:8081${NC}"
echo -e "     ├── Mailpit:           ${GREEN}http://localhost:8025${NC}"
echo -e "     └── Socket.io:         ${GREEN}ws://localhost:8080/socket.io${NC}"
echo ""
echo -e "  ${BLUE}📦 Base de datos:${NC}"
echo -e "     ├── Host:     ${YELLOW}localhost:3306${NC}"
echo -e "     ├── DB:       ${YELLOW}tfg_database${NC}"
echo -e "     ├── User:     ${YELLOW}tfg_user${NC}"
echo -e "     └── Password: ${YELLOW}tfg_password${NC}"
echo ""
echo -e "  ${BLUE}🔧 Comandos útiles:${NC}"
echo -e "     ├── Logs:     ${YELLOW}docker compose -f docker-compose.dev.yml logs -f${NC}"
echo -e "     ├── Parar:    ${YELLOW}docker compose -f docker-compose.dev.yml down${NC}"
echo -e "     ├── Artisan:  ${YELLOW}docker compose -f docker-compose.dev.yml exec api php artisan${NC}"
echo -e "     └── MySQL:    ${YELLOW}docker compose -f docker-compose.dev.yml exec mysql mysql -u tfg_user -p${NC}"
echo ""
