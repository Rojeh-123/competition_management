<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\SubmissionGalleryStat;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class GalleryController extends Controller
{
    public function index(Request $request)
    {
        $userId = Auth::id();

        $query = Submission::query()
            ->with([
                'competition.category',
                'galleryStats',
            ])
            ->whereIn('status', [
                'approved',
                'finished',
            ]);

        $submissions = $query->get();

        /*
        |--------------------------------------------------------------------------
        | Calculate gallery priority
        |--------------------------------------------------------------------------
        */

        $submissions = $submissions
            ->map(function ($submission) {

                $impressions =
                    $submission->galleryStats?->impressions ?? 0;

                $exposureScore = 100 / ($impressions + 1);

                $randomScore = mt_rand(0, 20);

                $recentPenalty = 0;

                if ($submission->galleryStats?->last_shown_at) {

                    $hoursSinceShown = now()->diffInHours(
                        $submission->galleryStats->last_shown_at
                    );

                    if ($hoursSinceShown < 24) {
                        $recentPenalty = 20;
                    }
                }

                $submission->gallery_score =
                    $exposureScore
                    + $randomScore
                    - $recentPenalty;

                return $submission;
            })
            ->sortByDesc('gallery_score');

        /*
        |--------------------------------------------------------------------------
        | Select submissions while keeping competition diversity
        |--------------------------------------------------------------------------
        */

        $selected = collect();

        $competitionCounts = [];

        foreach ($submissions as $submission) {

            $competitionId = $submission->competition_id;

            $count = $competitionCounts[$competitionId] ?? 0;

            if ($count >= 3) {
                continue;
            }

            $selected->push($submission);

            $competitionCounts[$competitionId] = $count + 1;

            if ($selected->count() >= 12) {
                break;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Record impressions
        |--------------------------------------------------------------------------
        */

        foreach ($selected as $submission) {

            $stats = SubmissionGalleryStat::firstOrCreate(
                [
                    'submission_id' => $submission->id,
                ],
                [
                    'impressions' => 0,
                    'likes' => 0,
                    'dislikes' => 0,
                ]
            );

            $stats->increment('impressions');

            $stats->update([
                'last_shown_at' => now(),
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Return gallery
        |--------------------------------------------------------------------------
        */

        return Inertia::render('GalleryPage', [
            'submissions' => $selected
                ->values()
                ->map(function ($submission) use ($userId) {

                    $hasVoted = false;

                    if ($userId) {
                        $hasVoted = $submission
                            ->submissionVotes()
                            ->where('user_id', $userId)
                            ->exists();
                    }

                    return [
                        'id' => $submission->id,
                        'title' => $submission->title,
                        'description' => $submission->description,
                        'status' => $submission->status,

                        'votes' => $submission
                            ->submissionVotes()
                            ->count(),

                        'competition' => [
                            'id' => $submission->competition?->id,
                            'title' => $submission->competition?->title,
                            'category' => $submission->competition?->category?->name,
                        ],

                        'hasVoted' => $hasVoted,
                        'userVote' => $hasVoted ? 'like' : null,
                    ];
                }),
        ]);
    }

    public function vote(Request $request)
    {
        $request->validate([
            'submission_id' => ['required', 'exists:submissions,id'],
            'action' => ['required', 'in:like,unlike'],
        ]);

        $user = $request->user();

        $vote = DB::table('submission_votes')
            ->where('user_id', $user->id)
            ->where('submission_id', $request->submission_id)
            ->first();

        if ($request->action === 'like' && !$vote) {
            DB::table('submission_votes')->insert([
                'user_id' => $user->id,
                'submission_id' => $request->submission_id,
                'created_at' => now(),
            ]);

            $stats = SubmissionGalleryStat::firstOrCreate(
                ['submission_id' => $request->submission_id],
                ['impressions' => 0, 'likes' => 0, 'dislikes' => 0]
            );

            $stats->increment('likes');
        }

        if ($request->action === 'unlike' && $vote) {
            DB::table('submission_votes')
                ->where('user_id', $user->id)
                ->where('submission_id', $request->submission_id)
                ->delete();

            $stats = SubmissionGalleryStat::where('submission_id', $request->submission_id)->first();

            if ($stats && $stats->likes > 0) {
                $stats->decrement('likes');
            }
        }

        $stats = SubmissionGalleryStat::where('submission_id', $request->submission_id)->first();

        return response()->json([
            'liked' => $request->action === 'like',
            'votes' => $stats->likes ?? 0,
        ]);
    }
}
