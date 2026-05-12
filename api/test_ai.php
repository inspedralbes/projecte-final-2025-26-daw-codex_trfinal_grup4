<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$service = app(App\Services\AiContentService::class);
$content = "React is a free and open-source front-end JavaScript library for building user interfaces based on components. It is maintained by Meta and a community of individual developers and companies. React can be used to develop single-page, mobile, or server-rendered applications with frameworks like Next.js. Because React is only concerned with rendering data to the DOM, creating React applications usually requires the use of additional libraries for routing and certain client-side functionality.";

echo "Analyzing post...\n";
echo "Enabled: " . config('services.ai_content.enabled') . "\n";
echo "URL: " . config('services.ai_content.url') . "\n";
$result = $service->analyzePost($content, null);
print_r($result);
