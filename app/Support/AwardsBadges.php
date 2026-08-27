<?php

namespace App\Support;

use App\Models\Badge;
use App\Models\Notification;
use App\Models\User;

trait AwardsBadges
{
    protected function awardBadge(User $user, string $slug): void
    {
        $badge = Badge::where('slug', $slug)->firstOrFail();

        $existing = $user->badges()->where('badge_id', $badge->id)->first();

        if ($existing) {
            $user->badges()->updateExistingPivot($badge->id, [
                'count'          => $existing->pivot->count + 1,
                'last_earned_at' => now(),
            ]);
        } else {
            $user->badges()->attach($badge->id, [
                'count'           => 1,
                'first_earned_at' => now(),
                'last_earned_at'  => now(),
            ]);
        }

        Notification::create([
            'user_id'    => $user->id,
            'title'      => 'Achievement Unlocked: ' . $badge->name,
            'message'    => $badge->description,
            'priority'   => 1,
            'is_read'    => false,
            'image'      => $badge->icon,
            'created_at' => now(),
        ]);
    }
}
