<?php

namespace App\Http\Controllers\Judge;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Submission;
use App\Models\Score;
use App\Models\CompetitionScoreCriterion;

class SubmissionController extends Controller
{
    public function review($id)
    {
        $user = Auth::user();

        $submission = Submission::with([
            'competition.scoreCriteria',
            'participant',
            'files',
            'scores' => function ($query) use ($user) {
                $query->where('judge_id', $user->id)
                    ->where('status', 'In Draft');
            },
        ])->findOrFail($id);

        $draftComment = Score::where(
                'submission_id',
                $submission->id
            )
            ->where('judge_id', $user->id)
            ->where('status', 'In Draft')
            ->whereNotNull('comment')
            ->value('comment');

        return Inertia::render('judge/JudgeReviewPage', [
            'submission' => [
                'id' => $submission->id,
                'title' => $submission->title,
                'description' => $submission->description,
                'competitionTitle' => $submission->competition->title,

                'participantName' => $submission->participant?->full_name
                    ?? $submission->participant?->username
                    ?? 'Unknown Participant',

                'files' => $submission->files->map(function ($file) {
                    return [
                        'id' => $file->id,
                        'file_name' => $file->file_name,
                        'file_path' => $file->file_path,
                        'file_type' => $file->file_type,
                        'file_size' => $file->file_size,
                    ];
                }),

                'criteria' => $submission->competition->scoreCriteria->map(function ($criterion) {
                    return [
                        'id' => $criterion->id,
                        'name' => $criterion->name,
                        'maxScore' => $criterion->max_score,
                    ];
                }),
            ],

            'draftScores' => $submission->scores->map(function ($score) {
                return [
                    'criterion_id' => $score->criterion_id,
                    'score' => (float) $score->score,
                ];
            }),

            'draftComment' => $draftComment,
        ]);
    }

    public function history()
    {
        $user = Auth::user();

        $maxScores = CompetitionScoreCriterion::selectRaw(
            'competition_id, SUM(max_score) as total'
        )
            ->groupBy('competition_id')
            ->pluck('total', 'competition_id');

        $scores = Score::with([
            'submission.competition',
        ])
            ->where('judge_id', $user->id)
            ->get()
            ->groupBy('submission_id')
            ->map(function ($submissionScores) use ($maxScores) {
                $firstScore = $submissionScores->first();

                $competitionId = $firstScore->submission?->competition?->id;

                return [
                    'id' => $firstScore->submission_id,
                    'submissionId' => $firstScore->submission_id,
                    'competitionTitle' => $firstScore->submission?->competition?->title,
                    'totalScore' => $submissionScores->sum(function ($score) {
                        return (float) $score->score;
                    }),
                    'maxScore' => $maxScores[$competitionId] ?? 0,
                    'status' => $firstScore->status,
                    'createdAt' => $firstScore->created_at?->toDateString(),
                ];
            })
            ->sortByDesc('createdAt')
            ->values();

        return Inertia::render('judge/JudgeHistoryPage', [
            'scores' => $scores,
        ]);
    }
}
