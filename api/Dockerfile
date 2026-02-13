# =============================================================
#  Backend – Laravel 11 (PHP 8.3-FPM Alpine)
# =============================================================
FROM php:8.3-fpm-alpine AS base

# -------------------------------------------------------------
#  System dependencies
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

# -------------------------------------------------------------
#  Composer
# -------------------------------------------------------------
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# -------------------------------------------------------------
#  Working directory
# -------------------------------------------------------------
WORKDIR /var/www/html

# -------------------------------------------------------------
#  Production stage – install dependencies & copy source
# -------------------------------------------------------------
FROM base AS production

COPY . /var/www/html

RUN composer install --no-dev --optimize-autoloader --no-interaction \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

USER www-data

EXPOSE 9000
CMD ["php-fpm"]

# -------------------------------------------------------------
#  Development stage – dependencies will be installed at runtime
#  via volume mount + init script
# -------------------------------------------------------------
FROM base AS development

# Add Xdebug for development
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

USER www-data

EXPOSE 9000
CMD ["php-fpm"]
