<?php

namespace App\Services;

use Stevebauman\Purify\Facades\Purify;

class SanitizationService
{
    /**
     * Sanitize HTML content to prevent XSS attacks.
     * Allows basic formatting tags but strips dangerous ones.
     */
    public function sanitizeHtml(?string $content): ?string
    {
        if ($content === null) {
            return null;
        }

        return Purify::clean($content);
    }

    /**
     * Sanitize a code snippet.
     * Code is fully escaped — no HTML tags allowed inside code blocks.
     */
    public function sanitizeCode(?string $code): ?string
    {
        if ($code === null) {
            return null;
        }

        // For code snippets we do a full htmlspecialchars encode
        // so that <script> etc. are stored as &lt;script&gt;
        return htmlspecialchars($code, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }

    /**
     * Sanitize a plain-text field (no HTML allowed at all).
     */
    public function sanitizePlain(?string $text): ?string
    {
        if ($text === null) {
            return null;
        }

        return strip_tags($text);
    }
}
