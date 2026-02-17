<?php

// Placeholder - Laravel public/index.php
// Este archivo será reemplazado cuando se instale Laravel completo.

header('Content-Type: application/json');

echo json_encode([
    'status' => 'ok',
    'service' => 'api',
    'framework' => 'Laravel 11 (pendiente de instalación)',
    'php_version' => phpversion(),
    'timestamp' => date('c'),
    'message' => 'El contenedor PHP-FPM está funcionando correctamente.'
]);
