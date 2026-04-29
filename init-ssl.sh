#!/bin/bash
# =============================================================
#  init-ssl.sh – Inicialización de SSL con Let's Encrypt
#  Uso: ./init-ssl.sh tu-dominio.com tu-email@ejemplo.com
# =============================================================

set -e

# ── Colores ──────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ── Validar argumentos ──────────────────────────────────────
if [ -z "$1" ] || [ -z "$2" ]; then
    echo -e "${RED}❌ Uso: ./init-ssl.sh <dominio> <email>${NC}"
    echo -e "   Ejemplo: ./init-ssl.sh miapp.com admin@miapp.com"
    exit 1
fi

DOMAIN=$1
EMAIL=$2
COMPOSE_FILE="docker-compose.prod.yml"

echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  🔒 Inicialización SSL – Let's Encrypt${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "  Dominio: ${GREEN}${DOMAIN}${NC}"
echo -e "  Email:   ${GREEN}${EMAIL}${NC}"
echo ""

# ── Paso 1: Crear configuración temporal Nginx (solo HTTP) ───
echo -e "${YELLOW}📝 Paso 1: Creando configuración temporal de Nginx (solo HTTP)...${NC}"

TEMP_CONF="docker/nginx/default.prod.temp.conf"
cat > "$TEMP_CONF" << 'NGINX_TEMP'
server {
    listen 80;
    server_name _;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 200 'SSL setup in progress...';
        add_header Content-Type text/plain;
    }
}
NGINX_TEMP

echo -e "${GREEN}  ✅ Configuración temporal creada${NC}"

# ── Paso 2: Levantar Nginx temporal ──────────────────────────
echo -e "${YELLOW}🚀 Paso 2: Levantando Nginx temporal...${NC}"

# Parar todo si estaba corriendo
docker compose -f "$COMPOSE_FILE" down 2>/dev/null || true

# Levantar solo Nginx con la config temporal
docker run -d \
    --name tfg_nginx_temp \
    -p 80:80 \
    -v "$(pwd)/$TEMP_CONF:/etc/nginx/conf.d/default.conf:ro" \
    -v tfg_certbot_www:/var/www/certbot \
    nginx:1.25-alpine

echo -e "${GREEN}  ✅ Nginx temporal levantado${NC}"

# Esperar a que Nginx esté listo
sleep 3

# ── Paso 3: Obtener certificado SSL ──────────────────────────
echo -e "${YELLOW}🔑 Paso 3: Solicitando certificado SSL a Let's Encrypt...${NC}"

docker run --rm \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v tfg_certbot_www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$DOMAIN"

echo -e "${GREEN}  ✅ Certificado SSL obtenido correctamente${NC}"

# ── Paso 4: Limpiar Nginx temporal ───────────────────────────
echo -e "${YELLOW}🧹 Paso 4: Limpiando Nginx temporal...${NC}"

docker stop tfg_nginx_temp && docker rm tfg_nginx_temp
rm -f "$TEMP_CONF"

echo -e "${GREEN}  ✅ Nginx temporal eliminado${NC}"

# ── Paso 5: Asegurar variable DOMAIN en .env ─────────────────
echo -e "${YELLOW}⚙️  Paso 5: Configurando variable DOMAIN...${NC}"

if [ -f .env ]; then
    if grep -q "^DOMAIN=" .env; then
        sed -i "s/^DOMAIN=.*/DOMAIN=${DOMAIN}/" .env
    else
        echo "DOMAIN=${DOMAIN}" >> .env
    fi
else
    echo "DOMAIN=${DOMAIN}" > .env
    echo -e "${YELLOW}  ⚠️  Se ha creado .env con DOMAIN. Asegúrate de añadir el resto de variables.${NC}"
fi

echo -e "${GREEN}  ✅ Variable DOMAIN=${DOMAIN} configurada en .env${NC}"

# ── Paso 6: Levantar el stack completo con SSL ───────────────
echo -e "${YELLOW}🚀 Paso 6: Levantando el stack completo con SSL...${NC}"

docker compose -f "$COMPOSE_FILE" up --build -d

echo -e "${GREEN}  ✅ Stack completo levantado${NC}"

# ── Paso 7: Verificar ────────────────────────────────────────
echo ""
sleep 5
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 ¡SSL configurado correctamente!${NC}"
echo -e "${CYAN}══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Tu sitio: ${GREEN}https://${DOMAIN}${NC}"
echo -e "  🔄 HTTP redirige automáticamente a HTTPS"
echo -e "  🔌 WebSockets: ${GREEN}wss://${DOMAIN}/socket.io/${NC}"
echo ""
echo -e "${YELLOW}  📝 RENOVACIÓN AUTOMÁTICA:${NC}"
echo -e "  Añade este cron job al servidor (sudo crontab -e):"
echo ""
echo -e "  ${CYAN}0 3 * * * cd $(pwd) && docker compose -f $COMPOSE_FILE run --rm certbot renew --quiet && docker compose -f $COMPOSE_FILE exec webserver nginx -s reload${NC}"
echo ""
