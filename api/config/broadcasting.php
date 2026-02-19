<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Broadcaster
    |--------------------------------------------------------------------------
    |
    | Redis is used so that Node.js (Socket.io) can subscribe to the same
    | channels via ioredis and relay events to connected WebSocket clients.
    |
    */

    'default' => env('BROADCAST_CONNECTION', 'null'),

    'connections' => [

        'redis' => [
            'driver' => 'redis',
            'connection' => 'default',   // uses database.redis.default
        ],

        'log' => [
            'driver' => 'log',
        ],

        'null' => [
            'driver' => 'null',
        ],

    ],

];
