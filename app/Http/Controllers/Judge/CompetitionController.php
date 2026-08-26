<?php

namespace App\Http\Controllers\Judge;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Score;
use App\Models\Submission;

class CompetitionController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();

        $assignedCompetitions = $user->judgingCompetitions()->count();

        $totalAssignedSubmissions = Submission::whereHas(
            'competition.judges',
            function ($query) use ($user) {
                $query->where('judge_id', $user->id);
            }
        )
            ->where('status', 'approved')
            ->count();

        $completedEvaluations = Score::where('judge_id', $user->id)
            ->where('status', 'Locked')
            ->distinct()
            ->count('submission_id');

        $draftEvaluations = Score::where('judge_id', $user->id)
            ->where('status', 'In Draft')
            ->distinct()
            ->count('submission_id');

        $pendingReviews = max(
            0,
            $totalAssignedSubmissions -
            ($completedEvaluations + $draftEvaluations)
        );

        $completionPercentage = $totalAssignedSubmissions > 0
            ? round(
                ($completedEvaluations / $totalAssignedSubmissions) * 100
            )
            : 0;

        return Inertia::render('judge/JudgeDashboard', [
            'stats' => [
                'assignedCompetitions' => $assignedCompetitions,
                'pendingReviews' => $pendingReviews,
                'draftEvaluations' => $draftEvaluations,
                'completedEvaluations' => $completedEvaluations,
                'completionPercentage' => $completionPercentage,
            ],
        ]);
    }

    public function index()
    {
        $competitions = Competition::with("judges")->get();
        return Inertia::render('judge/JudgeCompetitionsPage', [
            'competitions' => $competitions,
        ]);
    }

    public function submissions(Int $id)
    {
        $user = Auth::user();

        $competition = Competition::with(['submissions.participant'])
            ->findOrFail($id);

        $submissions = $competition->submissions()
            ->with([
                'scores' => function ($query) use ($user) {
                    $query->where('judge_id', $user->id)
                        ->where('status', 'In Draft');
                },
            ])
            ->where('status', 'approved')
            ->where(function ($query) use ($user) {
                $query->whereDoesntHave('scores')
                    ->orWhereHas('scores', function ($q) use ($user) {
                        $q->where('judge_id', $user->id)
                            ->where('status', 'In Draft');
                    });
            })
            ->latest()
            ->get()
            ->map(fn ($submission) => [
                'id' => $submission->id,
                'title' => $submission->title,
                'description' => $submission->description,
                'status' => $submission->status,
                'hasDraft' => $submission->scores->isNotEmpty(),
                'createdAt' => $submission->created_at?->toDateString(),
                'participantName' => $submission->participant?->full_name
                    ?? $submission->participant?->username
                    ?? 'Unknown participant',
            ]);

        return Inertia::render('judge/JudgeSubmissionsQueue', [
            'competitionId' => $competition->id,
            'competitionTitle' => $competition->title,
            'submissions' => $submissions,
        ]);
    }
}
