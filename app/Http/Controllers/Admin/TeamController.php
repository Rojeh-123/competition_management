<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\Competition;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Helpers\AuditLogger;
use App\Models\Notification;
use App\Models\Badge;

class TeamController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/Teams/Index', [
            'teams' => Team::with(['competition', 'members'])->latest()->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/Teams/Create', [
            'competitions' => Competition::select('id', 'title')->where('team_allowed', 1)->get(),
            'participants' => User::where('role', 'participant')->select('id', 'username', 'full_name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'competition_id' => 'nullable|exists:competitions,id',
            'member_ids' => 'array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $team = Team::create([
            'name' => $validated['name'],
            'competition_id' => $validated['competition_id'] ?? null,
        ]);

        $team->members()->sync($validated['member_ids'] ?? []);
        $team_player = Badge::where('slug', 'team-player')->firstOrFail();

        foreach ($validated['member_ids'] ?? [] as $memberId) {
            $user = User::findOrFail($memberId);

            $existing = $user->badges()->where('badge_id', 9)->first();

            if ($existing) {
                $user->badges()->updateExistingPivot(9, [
                    'count'          => $existing->pivot->count + 1,
                    'last_earned_at' => now(),
                ]);
            } else {
                $user->badges()->attach(9, [
                    'count'           => 1,
                    'first_earned_at' => now(),
                    'last_earned_at'  => now(),
                ]);
            }

            Notification::create([
                'user_id' => $memberId,
                'title' => 'Achievement Unlocked: ' . $team_player->name,
                'message' => $team_player->description,
                'priority' => 1,
                'is_read' => false,
                'image' => $team_player->icon,
                'created_at' => now(),
            ]);
        }

        AuditLogger::log(
            action: 'CREATE',
            table: 'teams',
            recordId: $team->id,
            details: "Created team '{$team->name}'",
            request: $request
        );

        return redirect()->route('admin.teams')->with('success', 'Team created.');
    }

    public function edit(Team $team)
    {
        return Inertia::render('admin/Teams/Edit', [
            'team' => $team->load(['members', 'competition']),
            'competitions' => Competition::select('id', 'title')->where('team_allowed', 1)->get(),
            'participants' => User::where('role', 'participant')->select('id', 'username', 'full_name')->get(),
        ]);
    }

    public function update(Request $request, Team $team)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'competition_id' => 'nullable|exists:competitions,id',
            'member_ids' => 'array',
            'member_ids.*' => 'exists:users,id',
        ]);

        $team->update([
            'name' => $validated['name'],
            'competition_id' => $validated['competition_id'] ?? null,
        ]);

        $team->members()->sync($validated['member_ids'] ?? []);

        AuditLogger::log(
            action: 'UPDATE',
            table: 'teams',
            recordId: $team->id,
            details: "Updated team '{$team->name}'",
            request: $request
        );

        return redirect()->route('admin.teams')->with('success', 'Team updated.');
    }

    public function destroy(Request $request, Team $team)
    {
        $teamName = $team->name;
        $teamId = $team->id;

        $team->delete();

        AuditLogger::log(
            action: 'DELETE',
            table: 'teams',
            recordId: $teamId,
            details: "Deleted team '{$teamName}'",
            request: $request
        );

        return redirect()->route('admin.teams')->with('success', 'Team removed.');
    }
}
