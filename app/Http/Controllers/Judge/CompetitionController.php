<?php

namespace App\Http\Controllers\Judge;

use App\Http\Controllers\Controller;
use App\Models\Competition;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Score;
use App\Models\Submission;
use App\Models\JudgeAssignment;

class CompetitionController extends Controller
{
    public function dashboard()
    {
        $user = Auth::user();

        $assignedCompetitions = $user->judgingCompetitions()->count();

        $judgeableStatuses = ['submission_closed', 'judging'];

        $assignedCompetitionIds = $user->judgingCompetitions()
            ->whereIn('status', $judgeableStatuses)
            ->pluck('competitions.id');

        $judgingCompetitionIds = $user->judgingCompetitions()
            ->where('status', 'judging')
            ->pluck('competitions.id');

        $totalAssignedSubmissions = Submission::whereIn('competition_id', $assignedCompetitionIds)
            ->where('status', 'approved')
            ->count();

        $totalJudgingSubmissions = Submission::whereIn('competition_id', $judgingCompetitionIds)
            ->where('status', 'approved')
            ->count();

        $completedEvaluations = Score::where('judge_id', $user->id)
            ->where('status', 'Locked')
            ->whereIn('submission_id', function ($query) use ($assignedCompetitionIds) {
                $query->select('id')
                    ->from('submissions')
                    ->whereIn('competition_id', $assignedCompetitionIds);
            })
            ->distinct()
            ->count('submission_id');

        $completedJudgingEvaluations = Score::where('judge_id', $user->id)
            ->where('status', 'Locked')
            ->whereIn('submission_id', function ($query) use ($judgingCompetitionIds) {
                $query->select('id')
                    ->from('submissions')
                    ->whereIn('competition_id', $judgingCompetitionIds);
            })
            ->distinct()
            ->count('submission_id');

        $draftEvaluations = Score::where('judge_id', $user->id)
            ->where('status', 'In Draft')
            ->whereIn('submission_id', function ($query) use ($assignedCompetitionIds) {
                $query->select('id')
                    ->from('submissions')
                    ->whereIn('competition_id', $assignedCompetitionIds);
            })
            ->distinct()
            ->count('submission_id');

        $pendingReviews = max(0, $totalAssignedSubmissions - ($completedEvaluations + $draftEvaluations));

        $completionPercentage = $totalJudgingSubmissions > 0
            ? round(($completedJudgingEvaluations / $totalJudgingSubmissions) * 100)
            : 0;

        if($assignedCompetitionIds->count() == 0){
            $completionPercentage = 100;
        }

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
        $competitionIds = JudgeAssignment::where('judge_id', Auth::id())
            ->pluck('competition_id');

        $competitions = Competition::with('judges')
            ->whereIn('id', $competitionIds)
            ->get();

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
