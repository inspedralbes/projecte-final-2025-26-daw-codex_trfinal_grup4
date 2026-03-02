# =============================================================
#  Backend – Laravel 11 (PHP 8.3-FPM Alpine)
# =============================================================
FROM php:8.3-fpm-alpine AS base

# Etiqueta para identificar imagen
LABEL maintainer="Codex Team"
LABEL version="1.0"

# Aumentar el tiempo de timeout para composer
ENV COMPOSER_PROCESS_TIMEOUT=900

# -------------------------------------------------------------
#  System dependencies (mantenidas en la misma capa para mejor caché)
# -------------------------------------------------------------
RUN apk add --no-cache \
    curl \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    unzip \
    zip \
    icu-dev \
    oniguruma-dev \
    linux-headers \
    $PHPIZE_DEPS

# -------------------------------------------------------------
#  PHP Extensions
# -------------------------------------------------------------
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        bcmath \
        zip \
        gd \
        intl \
        mbstring \
        opcache

# Redis extension via PECL
RUN pecl install redis \
    && docker-php-ext-enable redis

# Optimizaciones de OPCache
RUN echo "opcache.enable_cli=1" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini && \
    echo "opcache.preload=/var/www/html/bootstrap/cache/preload.php" >> /usr/local/etc/php/conf.d/docker-php-ext-opcache.ini

# -------------------------------------------------------------
#  Composer
# -------------------------------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Permitir plugins de composer (para poder usar git en reqs)
RUN composer config --global allow-plugins.cweagans/composer-patches true

# Working directory
WORKDIR /var/www/html

# -------------------------------------------------------------
#  Production stage – install dependencies & copy source
# -------------------------------------------------------------
FROM base AS production

# Copiar primero composer.json y composer.lock para mejor caché
COPY composer.json composer.lock* ./

# Instalar dependencias sin los ficheros de source (--no-scripts para evitar errores pre-instalación)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Ahora copiar el resto del código (necesario para que los scripts funcionen correctamente)
COPY . .

# Ejecutar scripts de composer después de copiar todo el código
RUN composer dump-autoload --no-interaction --no-dev --optimize

# Permisos
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

USER www-data

EXPOSE 9000
CMD ["php-fpm"]

# -------------------------------------------------------------
#  Development stage
# -------------------------------------------------------------
FROM base AS development

# Add Xdebug para debugging
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

USER www-data

EXPOSE 9000
CMD ["php-fpm"]
