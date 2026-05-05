<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class RouteHealthTest extends TestCase
{
    /**
     * Verifica que todas las rutas GET de la API responden sin errores de servidor (500).
     */
    public function test_all_api_get_routes_return_ok_status()
    {
        // Obtenemos todas las rutas
        $routes = Route::getRoutes();
        $passed = 0;
        $failed = [];

        foreach ($routes as $route) {
            // Solo probamos rutas GET que pertenezcan a la API
            if (in_array('GET', $route->methods()) && str_contains($route->uri(), 'api')) {
                
                // Saltamos rutas con parámetros obligatorios (necesitarían datos específicos)
                if (str_contains($route->uri(), '{')) {
                    continue;
                }

                try {
                    $response = $this->get($route->uri());
                    
                    // Consideramos éxito si no es un error 5xx
                    // Es normal recibir 401 o 403 si no hay login, pero nunca 500
                    if ($response->status() >= 500) {
                        $failed[] = "{$route->uri()} (Status: {$response->status()})";
                    } else {
                        $passed++;
                    }
                } catch (\Exception $e) {
                    $failed[] = "{$route->uri()} (Exception: {$e->getMessage()})";
                }
            }
        }

        if (count($failed) > 0) {
            $this->fail("Las siguientes rutas han fallado:\n" . implode("\n", $failed));
        }

        $this->assertTrue(true, "Se han verificado $passed rutas correctamente.");
    }
}
