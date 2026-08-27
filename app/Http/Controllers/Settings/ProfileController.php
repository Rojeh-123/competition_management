<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
Use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use App\Models\Submission;
use App\Models\Competition;
use App\Models\Category;
use App\Models\CompetitionWinner;
use App\Models\CompetitionAnnouncement;
use App\Helpers\AuditLogger;

class ProfileController extends Controller
{
    public function updateProfile(Request $request): RedirectResponse
    {
        $validated = $request->validate($this->profileRules($request));

        $user = User::findOrFail(Auth::id());

        $oldUsername = $user->username;
        $oldEmail = $user->email;

        $user->update([
            'full_name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email'     => $validated['email'],
            'username'  => $validated['username'],
            'country'   => $validated['country'],
            'age'       => $validated['age'],
            'bio'       => $validated['bio'],
            'password'  => !empty($validated['password'])
                ? Hash::make($validated['password'])
                : $user->password,
        ]);


        if ($request->hasFile('image')) {

            if ($user->image && Storage::disk('public')->exists($user->image)) {
                Storage::disk('public')->delete($user->image);
            }

            $user->image = $request->file('image')->store('profile_images', 'public');
            $user->save();
        }


        AuditLogger::log(
            action: 'UPDATE',
            table: 'users',
            recordId: $user->id,
            details: "Updated profile for user '{$user->username}' (ID: {$user->id}). Previous username: '{$oldUsername}', Previous email: '{$oldEmail}'",
            request: $request
        );


        return redirect()
            ->route('home')
            ->with('success', 'Profile updated successfully.');
    }

    private function profileRules(Request $request): array
    {
        return [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255', 'unique:users,email,'. Auth::user()->id],
            'username'   => ['required', 'string', 'max:255', 'unique:users,username,'. Auth::user()->id],
            'country'    => ['required', 'string', 'max:255'],
            'oldPassword'=> ['nullable', 'current_password'],
            'password'   => ['nullable', 'string', 'min:8', 'confirmed', 'unique:users,password,'. Auth::user()->id],
            'age'        => ['nullable', 'integer', 'min:1', 'max:120'],
            'bio'        => ['nullable', 'string', 'max:1000'],
            'image'      => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif,webp', 'max:2048'],
        ];
    }

    public function deleteProfile(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();


        $userId = $user->id;
        $username = $user->username;
        $email = $user->email;


        if ($user->image) {
            Storage::disk('public')->delete($user->image);
        }


        AuditLogger::log(
            action: 'DELETE',
            table: 'users',
            recordId: $userId,
            details: "Deleted user account '{$username}' (Email: {$email}, User ID: {$userId})",
            request: $request
        );


        Auth::logout();

        $user->delete();


        $request->session()->invalidate();
        $request->session()->regenerateToken();


        return redirect('/')->with('success', 'Account deleted successfully.');
    }

    public function editProfile()
    {
        $user = Auth::user();
        return Inertia::render('AllUsers/EditProfilePage', [
            'user' => $user,
        ]);
    }

    public function show(Int $id)
    {
        $shownUser = User::findOrFail($id);

        if(Auth::id() == $shownUser->id || Auth::user()->role == 'admin'){
            return match ($shownUser->role) {
                'participant' => $this->participantProfile($shownUser),
                'judge' => $this->judgeProfile($shownUser),
                'admin' => $this->adminProfile($shownUser),
                default => abort(404),
            };
        }else{
            abort(403, 'You don’t have permission to access this page.');
        }
    }

    private function participantProfile(User $shownUser)
    {
        $shownUser->load([
            'submissions' => function ($query) {
                $query
                    ->with('competition:id,title')
                    ->withAvg('scores', 'score');
            },
            'badges' => function ($query) {
                $query->withPivot('count', 'first_earned_at', 'last_earned_at');
            },
        ]);

        $numberOfJoinedCompetitions = $shownUser->submissions()
            ->distinct('competition_id')
            ->count('competition_id');

        $numberOfMedals = CompetitionWinner::where(
            'participant_id',
            $shownUser->id
        )->count();

        $participants = User::query()
            ->whereHas('submissions')
            ->with([
                'submissions' => function ($query) {
                    $query->withAvg('scores', 'score');
                },
                'badges',
            ])
            ->get()
            ->map(function ($user) {
                $joinedCompetitions = $user->submissions()
                    ->distinct('competition_id')
                    ->count('competition_id');

                $firstPlaces = CompetitionWinner::where('participant_id', $user->id)
                    ->where('rank_position', 1)
                    ->count();

                $secondPlaces = CompetitionWinner::where('participant_id', $user->id)
                    ->where('rank_position', 2)
                    ->count();

                $thirdPlaces = CompetitionWinner::where('participant_id', $user->id)
                    ->where('rank_position', 3)
                    ->count();

                $averageScore = $user->submissions
                    ->avg('scores_avg_score') ?? 0;

                $badgeScore = $user->badges->sum(
                    fn($badge) => $badge->points * $badge->pivot->count
                );

                $rankScore =
                    ($joinedCompetitions * 10)
                    + ($firstPlaces * 100)
                    + ($secondPlaces * 70)
                    + ($thirdPlaces * 50)
                    + $averageScore
                    + $badgeScore;

                return [
                    'user_id' => $user->id,
                    'rank_score' => $rankScore,
                ];
            })
            ->sortByDesc('rank_score')
            ->values();

        $rank = $participants->search(
            fn($participant) => $participant['user_id'] === $shownUser->id
        ) + 1;

        return Inertia::render('participant/ProfilePage', [
            'shownUser' => $shownUser,
            'numberOfMedals' => $numberOfMedals,
            'numberOfJoinedCompetitions' => $numberOfJoinedCompetitions,
            'rank' => $rank,
        ]);
    }

    private function judgeProfile(User $shownUser)
    {
        $shownUser->load([
            'judgingCompetitions' => function ($query) {
                $query
                    ->select(
                        'competitions.id',
                        'competitions.title',
                        'competitions.category_id',
                        'competitions.status'
                    )
                    ->with([
                        'category:id,name',
                        'submissions:id,competition_id,title',
                    ]);
            },
        ]);

        $reviewedSubmissions = $shownUser->scores()
            ->with([
                'submission:id,title,competition_id',
                'submission.competition:id,title',
            ])
            ->select('submission_id')
            ->groupBy('submission_id')
            ->latest()
            ->get();

        $pendingEvaluations = Submission::whereIn(
            'competition_id',
            $shownUser->judgingCompetitions()->pluck('competitions.id')
        )
            ->whereDoesntHave('scores', function ($query) use ($shownUser) {
                $query->where('judge_id', $shownUser->id);
            })
            ->count();

        return Inertia::render('judge/ProfilePage', [
            'shownJudge' => [
                'id' => $shownUser->id,
                'username' => $shownUser->username,
                'full_name' => $shownUser->full_name,
                'email' => $shownUser->email,
                'role' => $shownUser->role,
                'country' => $shownUser->country,
                'bio' => $shownUser->bio,
                'image' => $shownUser->avatar_url,

                'completed_evaluations' => $reviewedSubmissions->count(),

                'pending_evaluations' => $pendingEvaluations,

                'assignments' => $shownUser->judgingCompetitions->map(function ($competition) use ($shownUser) {

                    $completedReviews = $competition
                        ->submissions()
                        ->whereHas('scores', function ($query) use ($shownUser) {
                            $query->where('judge_id', $shownUser->id);
                        })
                        ->count();

                    return [
                        'id' => $competition->id,

                        'submissions_count' => $competition->submissions->count(),

                        'completed_reviews' => $completedReviews,

                        'competition' => [
                            'id' => $competition->id,
                            'title' => $competition->title,
                            'status' => $competition->status,

                            'category' => [
                                'id' => $competition->category->id,
                                'name' => $competition->category->name,
                            ],
                        ],
                    ];
                })->values(),

                'reviewed_submissions' => $reviewedSubmissions
                    ->map(function ($review) {

                        return [
                            'id' => $review->submission->id,

                            'submission' => [
                                'id' => $review->submission->id,
                                'title' => $review->submission->title,
                            ],

                            'competition' => [
                                'id' => $review->submission->competition->id,
                                'title' => $review->submission->competition->title,
                            ],
                        ];
                    })
                    ->values(),
            ],
        ]);
    }

    private function adminProfile(User $shownUser)
    {
        $createdCompetitions = Competition::where('created_by', $shownUser->id)
            ->with('category:id,name')
            ->latest()
            ->get();

        return Inertia::render('admin/ProfilePage', [
            'shownAdmin' => [
                'id' => $shownUser->id,
                'username' => $shownUser->username,
                'full_name' => $shownUser->full_name,
                'email' => $shownUser->email,
                'role' => $shownUser->role,
                'country' => $shownUser->country,
                'bio' => $shownUser->bio,
                'image' => $shownUser->image,

                'competitions_created' => Competition::where(
                    'created_by',
                    $shownUser->id
                )->count(),

                'users_managed' => User::count(),

                'categories_managed' => Category::count(),

                'announcements_created' => CompetitionAnnouncement::where(
                    'created_by',
                    $shownUser->id
                )->count(),

                'created_competitions' => $createdCompetitions->map(function ($competition) {
                    return [
                        'id' => $competition->id,
                        'title' => $competition->title,
                        'status' => $competition->status,

                        'category' => [
                            'id' => $competition->category->id,
                            'name' => $competition->category->name,
                        ],
                    ];
                })->values(),
            ],
        ]);
    }
}
