<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Category;
use App\Models\Competition;
use App\Models\CompetitionParticipant;

class CompetitionController extends Controller
{
    public function home()
    {

        $numberOfJudges = User::where('role', 'judge')->count();
        $numberOfParticipants = User::where('role', 'participant')->count();

        $competitions = Competition::with('category', 'participants')
            ->where('visibility', 'public')
            ->where('team_allowed', 0)
            ->whereIn('status', [
                'open',
                'upcoming',
            ])
            ->inRandomOrder()
            ->take(3)
            ->get();

        $numberOfActiveCompetitions = Competition::where('status', 'open')->count();

        $category = Category::all();

        return Inertia::render('Index', [
            'numberOfJudges' => $numberOfJudges,
            'numberOfParticipants' => $numberOfParticipants,
            'competitions' => $competitions,
            'numberOfActiveCompetitions' => $numberOfActiveCompetitions,
            'category' => $category,
        ]);
    }

    public function winners()
    {
        $competitions = Competition::with([
            'category',
            'winners',
            'winners.submission.participant',
        ])
            ->where('visibility', 'public')
            ->where('status', 'results_published')
            ->orderByDesc('winner_announced_at')
            ->orderByDesc('end_date')
            ->get()
            ->map(function (Competition $competition) {
                $resultDate = $competition->winner_announced_at ?? $competition->end_date;

                return [
                    'id' => $competition->id,
                    'title' => $competition->title,
                    'numberOfWinners' => $competition->number_of_winners,
                    'category' => $competition->category?->name ?? 'Uncategorized',
                    'endDate' => $resultDate ? $resultDate->format('M d, Y') : 'TBD',
                    'image' => $competition->image
                        ? (str_starts_with($competition->image, 'http')
                            ? $competition->image
                            : asset('storage/' . ltrim($competition->image, '/')))
                        : null,
                    'winners' => $competition->winners
                        ->map(function ($winner) {
                            $scoreValue = $winner->final_score ?? $winner->score ?? null;
                            $rank = (int) ($winner->rank_position ?? $winner->rank ?? 1);
                            $participantName = User::find($winner->participant_id)?->username
                                ?? 'Winner pending';

                            return [
                                'rank' => $rank,
                                'participantName' => $participantName,
                                'score' => $scoreValue !== null ? (float) $scoreValue : null,
                                'scoreDisplay' => $scoreValue !== null
                                    ? number_format((float) $scoreValue, 2)
                                    : 'Rank #' . $rank,
                                'notes' => $winner->notes,
                            ];
                        })
                        ->values(),
                ];
            })
            ->values();

        return Inertia::render('WinnersPage', [
            'competitions' => $competitions,
        ]);
    }

    public function about()
    {
        return Inertia::render('AboutPage');
    }

    public function index()
    {
        return Inertia::render('CompetitionsPage', [
            'user' => Auth::user(),

            'competitions' => Competition::with([
                'category',
                'participants',
            ])
            ->where('visibility', 'public')
            ->where('team_allowed', 0)
            ->whereIn('status', [
                'open',
                'upcoming',
                'submission_closed',
                'judging',
                'results_published',
            ])
            ->latest()
            ->get(),

            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function show(Int $id)
    {
        $competition = Competition::with([
            'category',
            'participants',
            'submissions',
            'creator',
            'judges',
            'winners.participant',
            'winners.submission.participant',
            'scoreCriteria',
            'questionBank.questions',
        ])
        ->withCount([
            'participants',
            'submissions',
        ])
        ->findOrFail($id);

        if ($competition->visibility === 'private' && !$competition->participants->contains('id', Auth::id()) && Auth::user()->role != 'admin') {
            abort(403, 'This Competition is private and you are not authorized to view it.');
        }

        $isJoined = CompetitionParticipant::where('participant_id', Auth::id())
            ->where('competition_id', $id)
            ->first();

        return Inertia::render('CompetitionDetailsPage', [
            'user' => Auth::user(),
            'competition' => $competition,
            'isJoined' => $isJoined,
        ]);
    }
}
