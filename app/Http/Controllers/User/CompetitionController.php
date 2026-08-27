<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\CompetitionParticipant;
use App\Models\Competition;
use App\Helpers\AuditLogger;
use App\Models\Submission;
use App\Models\CompetitionWinner;

class CompetitionController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();

        $activeCompetitionsQuery = $user->participatingCompetitions()
            ->with('category')
            ->whereIn('competitions.status', [
                'open',
                'judging',
            ]);

        $activeCompetitionsCount = (clone $activeCompetitionsQuery)->count();

        $submittedEntries = Submission::where(
            'participant_id',
            $user->id
        )->count();

        $awardsWon = CompetitionWinner::where(
            'participant_id',
            $user->id
        )->count();

        $pendingSubmissions = $user->participatingCompetitions()
            ->where('competitions.status', 'Open')
            ->whereDoesntHave('submissions', function ($query) use ($user) {
                $query->where('participant_id', $user->id);
            })
            ->count();

        $submittedCompetitionIds = Submission::where(
            'participant_id',
            $user->id
        )
            ->pluck('competition_id')
            ->toArray();

        $activeCompetitions = $activeCompetitionsQuery
            ->get()
            ->map(function ($competition) use ($submittedCompetitionIds) {
                return [
                    'id' => $competition->id,
                    'title' => $competition->title,
                    'category' => $competition->category?->name,
                    'status' => $competition->status,
                    'submissionDeadline' => $competition->submission_deadline,
                    'image' => $competition->image,
                    'hasSubmitted' => in_array(
                        $competition->id,
                        $submittedCompetitionIds
                    ),
                ];
            });

        $upcomingDeadlines = $user->participatingCompetitions()
            ->where('competitions.status', 'Open')
            ->orderBy('competitions.submission_deadline')
            ->take(3)
            ->get()
            ->map(function ($competition) {
                return [
                    'id' => $competition->id,
                    'title' => $competition->title,
                    'deadline' => $competition->submission_deadline,
                ];
            });

        $recentSubmissions = Submission::with('competition')
            ->where('participant_id', $user->id)
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($submission) {
                return [
                    'id' => $submission->id,
                    'competition' => $submission->competition?->title,
                    'submittedAt' => $submission->created_at,
                ];
            });

        return Inertia::render('participant/ParticipantDashboard', [
            'user' => Auth::user(),
            'stats' => [
                'activeCompetitions' => $activeCompetitionsCount,
                'submittedEntries' => $submittedEntries,
                'awardsWon' => $awardsWon,
                'pendingSubmissions' => $pendingSubmissions,
            ],

            'activeCompetitions' => $activeCompetitions,

            'upcomingDeadlines' => $upcomingDeadlines,

            'recentSubmissions' => $recentSubmissions,
        ]);
    }

    public function myCompetitions()
    {
        $competitions = Competition::whereHas('participants', function ($query) {
            $query->where('participant_id', Auth::id())->where('team_allowed', 0);
        })
        ->withExists(['submissions as is_submitted' => function ($query) {
            $query->where('participant_id', Auth::id());
        }])
        ->get();

        return Inertia::render('participant/MyCompetitionsPage', [
            'competitions' => $competitions,
        ]);
    }

    public function joinCompetition(Request $request, Int $id)
    {
        $competition = Competition::findOrFail($id);

        $user = Auth::user();

        if($competition->min_age > $user->age || $competition->max_age < $user->age) {
            return redirect()
                ->route('competitions.show', ['id' => $id])
                ->with('error', 'You do not meet the age requirements for this competition.');
        }

        $participant = CompetitionParticipant::create([
            'competition_id' => $id,
            'participant_id' => Auth::id(),
            'status' => 'joined',
        ]);

        AuditLogger::log(
            action: 'CREATE',
            table: 'competition_participants',
            recordId: $participant->id,
            details: "User joined competition '{$competition->title}' (ID: {$competition->id})",
            request: $request
        );

        return redirect()
            ->route('competitions.show', ['id' => $id])
            ->with('success', 'Joined competition successfully.');
    }

    public function leaveCompetition(Request $request, Int $id)
    {
        $competition = Competition::findOrFail($id);

        $competitionTitle = $competition->title;

        $competition->participants()->detach(Auth::id());

        AuditLogger::log(
            action: 'DELETE',
            table: 'competition_participants',
            recordId: $id,
            details: "User left competition '{$competitionTitle}' (Competition ID: {$id})",
            request: $request
        );

        return redirect()
            ->route('participant.competitions')
            ->with('success', 'You have left the competition.');
    }
}
