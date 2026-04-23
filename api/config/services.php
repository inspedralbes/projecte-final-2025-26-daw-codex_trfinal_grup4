<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', rtrim(env('FRONTEND_URL', env('APP_URL', 'http://localhost')), '/') . '/auth/google/callback'),
    ],

    'ai_moderation' => [
        'enabled' => env('AI_MODERATION_ENABLED', false),
        'url' => rtrim(env('AI_MODERATION_URL', 'http://ai-moderation:8088'), '/'),
        'api_key' => env('AI_MODERATION_API_KEY'),
        'timeout_seconds' => (int) env('AI_MODERATION_TIMEOUT_SECONDS', 2),
        'fail_open' => env('AI_MODERATION_FAIL_OPEN', true),
        'timeout_hours' => (int) env('AI_MODERATION_TIMEOUT_HOURS', 24),
        'timeout_after_strikes' => (int) env('AI_MODERATION_TIMEOUT_AFTER_STRIKES', 2),
        'ban_after_strikes' => (int) env('AI_MODERATION_BAN_AFTER_STRIKES', 4),
        'critical_auto_ban' => env('AI_MODERATION_CRITICAL_AUTO_BAN', true),
    ],

];
