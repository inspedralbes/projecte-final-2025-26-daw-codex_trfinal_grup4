<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiContentService
{
    /**
     * @return array{summary: ?string, embedding: ?array}
     */
    public function analyzePost(?string $content, ?string $codeSnippet): array
    {
        if (!config('services.ai_content.enabled', false)) {
            return ['summary' => null, 'embedding' => null];
        }

        $baseUrl = config('services.ai_content.url');
        $apiKey = config('services.ai_content.api_key');
        $timeoutSeconds = (int) config('services.ai_content.timeout_seconds', 4);
        $failOpen = (bool) config('services.ai_content.fail_open', true);

        $payload = [
            'content' => $content,
            'code_snippet' => $codeSnippet,
        ];

        try {
            $request = Http::acceptJson()->timeout($timeoutSeconds);

            if (!empty($apiKey)) {
                $request = $request->withHeader('X-Api-Key', $apiKey);
            }

            $response = $request->post("{$baseUrl}/analyze-content", $payload);

            if (!$response->successful()) {
                Log::warning('AI content service returned non-success response.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $failOpen ? ['summary' => null, 'embedding' => null] : $this->fallback();
            }

            $data = $response->json();

            return [
                'summary' => isset($data['summary']) && is_string($data['summary'])
                    ? trim($data['summary'])
                    : null,
                'embedding' => isset($data['embedding']) && is_array($data['embedding'])
                    ? $data['embedding']
                    : null,
            ];
        } catch (\Throwable $exception) {
            Log::warning('AI content call failed.', [
                'message' => $exception->getMessage(),
            ]);

            return $failOpen ? ['summary' => null, 'embedding' => null] : $this->fallback();
        }
    }

    /**
     * @return array{summary: ?string, embedding: ?array}
     */
    private function fallback(): array
    {
        return ['summary' => null, 'embedding' => null];
    }
}
