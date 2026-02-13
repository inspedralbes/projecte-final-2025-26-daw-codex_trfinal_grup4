-- =============================================================
--  MySQL 8.0 – Script de inicialización
--  Se ejecuta automáticamente la primera vez que se crea
--  el contenedor (montado en /docker-entrypoint-initdb.d/)
-- =============================================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS `tfg_database`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

-- Crear usuario de la aplicación
CREATE USER IF NOT EXISTS 'tfg_user'@'%' IDENTIFIED BY 'tfg_password';
GRANT ALL PRIVILEGES ON `tfg_database`.* TO 'tfg_user'@'%';

-- Crear base de datos para testing
CREATE DATABASE IF NOT EXISTS `tfg_testing`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON `tfg_testing`.* TO 'tfg_user'@'%';

FLUSH PRIVILEGES;
