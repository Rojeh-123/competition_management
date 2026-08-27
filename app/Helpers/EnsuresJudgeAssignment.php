<?php

namespace App\Helpers;

use App\Models\Competition;
use Illuminate\Support\Facades\Auth;

trait EnsuresJudgeAssignment
{
    protected function assertJudgeAssignedToCompetition(Competition $competition): void
    {
        $isAssigned = $competition->judges()
            ->where('users.id', Auth::id())
            ->exists();

        if (! $isAssigned) {
            abort(403, 'You are not assigned to judge this competition.');
        }
    }
}
