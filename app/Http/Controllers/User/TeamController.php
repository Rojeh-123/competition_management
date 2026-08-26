<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Team;
use App\Models\Submission;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function myTeams()
    {
        $teams = Auth::user()
            ->teams()
            ->with(['competition', 'members'])
            ->get();

        return Inertia::render('participant/Teams/Index', [
            'teams' => $teams,
        ]);
    }

    public function show(Team $team)
    {
        abort_unless($team->members->contains(Auth::id()), 403);

        $team->load([
            'competition.category',
            'members',
        ]);

        $hasSubmitted = Submission::where('team_id', $team->id)->exists();

        return Inertia::render('participant/Teams/Show', [
            'team' => $team,
            'hasSubmitted' => $hasSubmitted,
        ]);
    }
}
