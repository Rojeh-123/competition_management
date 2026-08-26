<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Competition;
use App\Models\Submission;
use App\Models\User;
use App\Models\SubmissionFile;
use App\Helpers\AuditLogger;
use App\Models\Notification;
use App\Models\Badge;

class SubmissionController extends Controller
{
    public function create(Int $competitionId, ?Int $teamId = null)
    {
        $competition = Competition::findOrFail($competitionId);
        return Inertia::render('participant/SubmitEntryPage', [
            'competition' => $competition,
            'teamId' => $teamId,
        ]);
    }

    public function store(Request $request)
    {
        $competition = Competition::findOrFail($request->competition_id);

        $extensions = collect(explode(',', $competition->allowed_file_types))
            ->map(fn ($type) => ltrim(trim($type), '.'))
            ->implode(',');

        $maxFileSize = $competition->max_file_size_mb * 1024;

        $validated = $request->validate([
            'competition_id' => ['required', 'exists:competitions,id'],
            'category_id' => ['nullable', 'exists:competition_categories,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'teamId' => ['nullable'],
            'original' => ['accepted'],

            'files' => ['required', 'array', 'min:1'],

            'files.*' => [
                'file',
                'mimes:' . $extensions,
                'max:' . $maxFileSize,
            ],
        ], [
            'files.*.max' => "Each file must not exceed {$competition->max_file_size_mb} MB.",
        ]);

        $submission = Submission::create([
            'competition_id' => $validated['competition_id'],
            'participant_id' => Auth::id(),
            'team_id' => $validated['teamId'],
            'category_id' => $competition->category_id,
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'status' => 'pending',
            'is_public' => $competition->visibility === "public",
        ]);

        $user = User::findOrFail(Auth::id());
        $first_steps = Badge::where('slug', 'first-steps')->firstOrFail();
        $early_bird = Badge::where('slug', 'early-bird')->firstOrFail();
        $streak_3   = Badge::where('slug', 'streak-3')->firstOrFail();
        $streak_5   = Badge::where('slug', 'streak-5')->firstOrFail();
        $streak_10  = Badge::where('slug', 'streak-10')->firstOrFail();

        $existing = $user->badges()->where('badge_id', 1)->first();

        if ($existing) {
            $user->badges()->updateExistingPivot(1, [
                'count'          => $existing->pivot->count + 1,
                'last_earned_at' => now(),
            ]);
        } else {
            $user->badges()->attach(1, [
                'count'           => 1,
                'first_earned_at' => now(),
                'last_earned_at'  => now(),
            ]);
        }

        Notification::create([
            'user_id' => $user->id,
            'title' => 'Achievement Unlocked: ' . $first_steps->name,
            'message' => $first_steps->description,
            'priority' => 1,
            'is_read' => false,
            'image' => $first_steps->icon,
            'created_at' => now(),
        ]);

        if ($competition->starts_at && $submission->created_at->lessThanOrEqualTo($competition->starts_at->addHour())) {
            $existing = $user->badges()->where('badge_id', 8)->first();

            if ($existing) {
                $user->badges()->updateExistingPivot(8, [
                    'count'          => $existing->pivot->count + 1,
                    'last_earned_at' => now(),
                ]);
            } else {
                $user->badges()->attach(8, [
                    'count'           => 1,
                    'first_earned_at' => now(),
                    'last_earned_at'  => now(),
                ]);
            }

            Notification::create([
                'user_id' => $user->id,
                'title' => 'Achievement Unlocked: ' . $early_bird->name,
                'message' => $early_bird->description,
                'priority' => 1,
                'is_read' => false,
                'image' => $early_bird->icon,
                'created_at' => now(),
            ]);
        }

        $isFirstSubmissionForCompetition = Submission::where('participant_id', $user->id)
            ->where('competition_id', $competition->id)
            ->count() === 1;

        if ($isFirstSubmissionForCompetition) {
            $user->increment('competition_streak');

            if ($user->competition_streak === 3) {
                $existing = $user->badges()->where('badge_id', 5)->first();

                if ($existing) {
                    $user->badges()->updateExistingPivot(5, [
                        'count'          => $existing->pivot->count + 1,
                        'last_earned_at' => now(),
                    ]);
                } else {
                    $user->badges()->attach(5, [
                        'count'           => 1,
                        'first_earned_at' => now(),
                        'last_earned_at'  => now(),
                    ]);
                }

                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'Achievement Unlocked: ' . $streak_3->name,
                    'message' => $streak_3->description,
                    'priority' => 1,
                    'is_read' => false,
                    'image' => $streak_3->icon,
                    'created_at' => now(),
                ]);
            }

            if ($user->competition_streak === 5) {
                $existing = $user->badges()->where('badge_id', 6)->first();

                if ($existing) {
                    $user->badges()->updateExistingPivot(6, [
                        'count'          => $existing->pivot->count + 1,
                        'last_earned_at' => now(),
                    ]);
                } else {
                    $user->badges()->attach(6, [
                        'count'           => 1,
                        'first_earned_at' => now(),
                        'last_earned_at'  => now(),
                    ]);
                }

                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'Achievement Unlocked: ' . $streak_5->name,
                    'message' => $streak_5->description,
                    'priority' => 1,
                    'is_read' => false,
                    'image' => $streak_5->icon,
                    'created_at' => now(),
                ]);
            }

            if ($user->competition_streak === 10) {
                $existing = $user->badges()->where('badge_id', 7)->first();

                if ($existing) {
                    $user->badges()->updateExistingPivot(7, [
                        'count'          => $existing->pivot->count + 1,
                        'last_earned_at' => now(),
                    ]);
                } else {
                    $user->badges()->attach(7, [
                        'count'           => 1,
                        'first_earned_at' => now(),
                        'last_earned_at'  => now(),
                    ]);
                }

                Notification::create([
                    'user_id' => $user->id,
                    'title' => 'Achievement Unlocked: ' . $streak_10->name,
                    'message' => $streak_10->description,
                    'priority' => 1,
                    'is_read' => false,
                    'image' => $streak_10->icon,
                    'created_at' => now(),
                ]);
            }
        }

        foreach ($request->file('files') as $file) {

            $path = $file->store('submissions', 'public');

            SubmissionFile::create([
                'submission_id' => $submission->id,
                'file_name' => $file->getClientOriginalName(),
                'file_path' => $path,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
            ]);
        }

        AuditLogger::log(
            action: 'CREATE',
            table: 'submissions',
            recordId: $submission->id,
            details: "Created submission '{$submission->title}' for competition '{$competition->title}' (Competition ID: {$competition->id})",
            request: $request
        );

        if (!empty($validated['teamId'])) {
            return redirect()
                ->route('participant.teams.show', [
                    'team' => $validated['teamId'],
                ])
                ->with('success', 'Submission created successfully.');
        }

        return redirect()
            ->route('participant.competitions')
            ->with('success', 'Submission created successfully.');
    }
}
