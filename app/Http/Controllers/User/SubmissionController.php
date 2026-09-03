<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Competition;
use App\Models\Submission;
use App\Models\User;
use App\Models\Team;
use App\Models\SubmissionFile;
use App\Helpers\AwardsBadges;
use App\Helpers\AuditLogger;

class SubmissionController extends Controller
{
    use AwardsBadges;

    public function create(Int $competitionId, ?Int $teamId = null)
    {
        $competition = Competition::findOrFail($competitionId);

        $isParticipant = $competition->participants()
            ->where('participant_id', Auth::id())
            ->exists()
            || Team::where('competition_id', $competition->id)
            ->whereHas('members', function ($query) {
                $query->where('users.id', Auth::id());
            })
            ->exists();

        if (!$isParticipant) {
            abort(403, 'You are not registered in this competition.');
        }

        if ($teamId) {
            $isTeamMember = Team::where('id', $teamId)
                ->where('competition_id', $competitionId)
                ->whereHas('members', function ($query) {
                    $query->where('user_id', Auth::id());
                })
                ->exists();

            if (!$isTeamMember) {
                abort(403, 'You are not a member of this team.');
            }
        }

        return Inertia::render('participant/SubmitEntryPage', [
            'competition' => $competition,
            'teamId' => $teamId,
        ]);
    }

    public function store(Request $request)
    {
        $competition = Competition::findOrFail($request->competition_id);

        $extensions = collect(explode(',', $competition->allowed_file_types))
            ->map(fn($type) => ltrim(trim($type), '.'))
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

        if(!$user->badges()->where('slug', 'first-steps')){
            $this->awardBadge($user, 'first-steps');
        }

        if ($competition->starts_at && $submission->created_at->lessThanOrEqualTo($competition->starts_at->addHour())) {
            $this->awardBadge($user, 'early-bird');
        }

        $isFirstSubmissionForCompetition = Submission::where('participant_id', $user->id)
            ->where('competition_id', $competition->id)
            ->count() === 1;

        if ($isFirstSubmissionForCompetition) {
            $user->increment('competition_streak');

            $streakBadges = [
                3  => 'streak-3',
                5  => 'streak-5',
                10 => 'streak-10',
            ];

            if (isset($streakBadges[$user->competition_streak])) {
                $this->awardBadge($user, $streakBadges[$user->competition_streak]);
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
