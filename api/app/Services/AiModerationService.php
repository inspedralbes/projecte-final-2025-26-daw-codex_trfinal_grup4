<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiModerationService
{
    /**
     * Analyze post content with the AI moderation microservice.
     *
     * @return array{allowed: bool, score: float, severity: string, reason: string, categories: array<int, mixed>}
     */
    public function moderatePost(?string $content, ?string $codeSnippet, bool $hasImage = false): array
    {
        if (!config('services.ai_moderation.enabled', false)) {
            return $this->allow('AI moderation disabled.');
        }

        $baseUrl = config('services.ai_moderation.url');
        $apiKey = config('services.ai_moderation.api_key');
        $timeoutSeconds = (int) config('services.ai_moderation.timeout_seconds', 2);
        $failOpen = (bool) config('services.ai_moderation.fail_open', true);

        $payload = [
            'context' => 'post',
            'content' => $content,
            'code_snippet' => $codeSnippet,
            'image_present' => $hasImage,
        ];

        try {
            $request = Http::acceptJson()->timeout($timeoutSeconds);

            if (!empty($apiKey)) {
                $request = $request->withHeader('X-Api-Key', $apiKey);
            }

            $response = $request->post("{$baseUrl}/moderate", $payload);

            if (!$response->successful()) {
                Log::warning('AI moderation returned non-success response.', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return $failOpen
                    ? $this->allow('AI moderation unavailable, fail-open active.')
                    : $this->block('high', 1.0, 'AI moderation unavailable and fail-open is disabled.', ['service_unavailable']);
            }

            $data = $response->json();

            return [
                'allowed' => (bool) ($data['allowed'] ?? true),
                'score' => (float) ($data['score'] ?? 0.0),
                'severity' => (string) ($data['severity'] ?? 'low'),
                'reason' => (string) ($data['reason'] ?? 'No reason provided.'),
                'categories' => is_array($data['categories'] ?? null) ? $data['categories'] : [],
            ];
        } catch (\Throwable $exception) {
            Log::warning('AI moderation call failed.', [
                'message' => $exception->getMessage(),
            ]);

            return $failOpen
                ? $this->allow('AI moderation call failed, fail-open active.')
                : $this->block('high', 1.0, 'AI moderation call failed and fail-open is disabled.', ['service_exception']);
        }
    }

    /**
     * @return array{allowed: bool, score: float, severity: string, reason: string, categories: array<int, mixed>}
     */
    private function allow(string $reason): array
    {
        return [
            'allowed' => true,
            'score' => 0.0,
            'severity' => 'low',
            'reason' => $reason,
            'categories' => [],
        ];
    }

    /**
     * @param array<int, mixed> $categories
     * @return array{allowed: bool, score: float, severity: string, reason: string, categories: array<int, mixed>}
     */
    private function block(string $severity, float $score, string $reason, array $categories): array
    {
        return [
            'allowed' => false,
            'score' => $score,
            'severity' => $severity,
            'reason' => $reason,
            'categories' => $categories,
        ];
    }
}
