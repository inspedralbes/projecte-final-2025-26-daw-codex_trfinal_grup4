<?php

namespace App\Services;

use App\Models\User;

class ModerationEnforcementService
{
    /**
     * Update user sanctions after a rejected post.
     *
     * @param array{severity?: string, reason?: string} $moderationDecision
     * @return array{action: string, strikes: int, ban_status: string, reason: string}
     */
    public function enforceForRejectedPost(User $user, array $moderationDecision): array
    {
        $severity = (string) ($moderationDecision['severity'] ?? 'medium');
        $reason = (string) ($moderationDecision['reason'] ?? 'Rejected by AI moderation policy.');

        $timeoutAfterStrikes = (int) config('services.ai_moderation.timeout_after_strikes', 2);
        $banAfterStrikes = (int) config('services.ai_moderation.ban_after_strikes', 4);
        $timeoutHours = (int) config('services.ai_moderation.timeout_hours', 24);
        $criticalAutoBan = (bool) config('services.ai_moderation.critical_auto_ban', true);

        $currentStrikes = (int) ($user->ai_moderation_strikes ?? 0);
        $nextStrikes = $currentStrikes + 1;

        $action = 'flagged';
        $nextBanStatus = 'flagged';
        $isBlocked = false;
        $banExpiresAt = null;

        if ($criticalAutoBan && $severity === 'critical') {
            $action = 'banned';
            $nextBanStatus = 'banned';
            $isBlocked = true;
        } elseif ($severity === 'high') {
            $action = 'timeout';
            $nextBanStatus = 'timeout';
            $isBlocked = true;
            $banExpiresAt = now()->addHours($timeoutHours);
        } elseif ($nextStrikes >= $banAfterStrikes) {
            $action = 'banned';
            $nextBanStatus = 'banned';
            $isBlocked = true;
        } elseif ($nextStrikes >= $timeoutAfterStrikes) {
            $action = 'timeout';
            $nextBanStatus = 'timeout';
            $isBlocked = true;
            $banExpiresAt = now()->addHours($timeoutHours);
        }

        $user->update([
            'ai_moderation_strikes' => $nextStrikes,
            'is_blocked' => $isBlocked,
            'ban_status' => $nextBanStatus,
            'ban_reason' => $reason,
            'ban_expires_at' => $banExpiresAt,
        ]);

        if ($nextBanStatus === 'banned') {
            $user->tokens()->delete();
        }

        return [
            'action' => $action,
            'strikes' => $nextStrikes,
            'ban_status' => $nextBanStatus,
            'reason' => $reason,
        ];
    }
}
