<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Category;
use App\Models\Competition;
use App\Models\CompetitionScoreCriterion;
use Illuminate\Support\Facades\Storage;
use App\Models\CompetitionParticipant;
use App\Helpers\AuditLogger;
use App\Models\User;

class CompetitionController extends Controller
{
    public function index()
    {
        $competitions = Competition::withCount('participants')->get();

        return Inertia::render('admin/ManageCompetitionsPage', [
            'competitions' => $competitions,
        ]);
    }

    public function create()
    {
        $categories = Category::all();
        return Inertia::render('admin/CreateAndEditCompetitionPages', [
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Basic
            'title' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'category_id' => ['required', 'exists:categories,id'],
            'description' => ['required', 'string'],
            'rules' => ['required', 'string'],

            // Dates
            'start_date' => ['required', 'date'],
            'published_at' => ['nullable', 'date'],
            'registration_deadline' => ['required', 'date', 'after_or_equal:start_date'],
            'submission_deadline' => ['required', 'date', 'after:registration_deadline'],
            'judging_start_date' => ['nullable', 'date', 'after:submission_deadline'],
            'judging_end_date' => ['nullable', 'date', 'after:judging_start_date'],
            'end_date' => ['required', 'date', 'after_or_equal:judging_end_date'],
            'winner_announced_at' => ['nullable', 'date', 'after_or_equal:end_date'],

            // Files & prizes
            'max_file_size_mb' => ['required', 'integer', 'min:1'],
            'allowed_file_types' => ['required', 'string'],
            'number_of_winners' => ['required', 'integer', 'min:1'],
            'prize_description' => ['nullable', 'string'],

            // Options
            'visibility' => ['required', 'in:public,private'],
            'is_featured' => ['boolean'],
            'team_allowed' => ['boolean'],
            'certificate_enabled' => ['boolean'],
            'requires_approval' => ['boolean'],

            // Age
            'min_age' => ['nullable', 'integer', 'min:0'],
            'max_age' => ['nullable', 'integer', 'gte:min_age'],

            // Contact
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
        ]);

        // Upload image
        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store(
                'competitions',
                'public'
            );
        }

        // Checkbox defaults
        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['team_allowed'] = $request->boolean('team_allowed');
        $validated['certificate_enabled'] = $request->boolean('certificate_enabled');
        $validated['requires_approval'] = $request->boolean('requires_approval');

        // Creator
        $validated['created_by'] = Auth::id();

        // Determine status
        $validated['status'] = (new Competition($validated))->computeStatus();

        $competition = Competition::create($validated);

        AuditLogger::log(
            action: 'CREATE',
            table: 'competitions',
            recordId: $competition->id,
            details: "Created competition '{$competition->title}'",
            request: $request
        );

        return redirect()
            ->route('admin.competitions')
            ->with('success', 'Competition created successfully.');
    }

    public function show(string $id)
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
        ])
            ->withCount([
                'participants',
                'submissions',
            ])
            ->findOrFail($id);

        $isJoined = CompetitionParticipant::where('participant_id', Auth::id())
            ->where('competition_id', $id)
            ->first();

        return Inertia::render('CompetitionDetailsPage', [
            'user' => Auth::user(),
            'competition' => $competition,
            'isJoined' => $isJoined,
        ]);
    }

    public function edit(Competition $competition)
    {
        return Inertia::render('admin/CreateAndEditCompetitionPages', [
            'competition' => $competition,
            'categories' => Category::all(),
            'user' => Auth::user(),
        ]);
    }

    public function update(Request $request, Competition $competition)
    {
        $validated = $request->validate([
            // Basic
            'title' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
            'category_id' => ['required', 'exists:categories,id'],
            'description' => ['required', 'string'],
            'rules' => ['required', 'string'],

            // Dates
            'start_date' => ['required', 'date'],
            'published_at' => ['nullable', 'date'],
            'registration_deadline' => ['required', 'date', 'after_or_equal:start_date'],
            'submission_deadline' => ['required', 'date', 'after:registration_deadline'],
            'judging_start_date' => ['nullable', 'date', 'after:submission_deadline'],
            'judging_end_date' => ['nullable', 'date', 'after:judging_start_date'],
            'end_date' => ['required', 'date', 'after_or_equal:judging_end_date'],
            'winner_announced_at' => ['nullable', 'date', 'after_or_equal:end_date'],

            // Files & prizes
            'max_file_size_mb' => ['required', 'integer', 'min:1'],
            'allowed_file_types' => ['required', 'string'],
            'number_of_winners' => ['required', 'integer', 'min:1'],
            'prize_description' => ['nullable', 'string'],

            // Options
            'visibility' => ['required', 'in:public,private'],
            'is_featured' => ['boolean'],
            'team_allowed' => ['boolean'],
            'certificate_enabled' => ['boolean'],
            'requires_approval' => ['boolean'],

            // Age
            'min_age' => ['nullable', 'integer', 'min:0'],
            'max_age' => ['nullable', 'integer', 'gte:min_age'],

            // Contact
            'contact_email' => ['nullable', 'email', 'max:255'],
            'contact_phone' => ['nullable', 'string', 'max:255'],
        ]);

        // Replace image if a new one was uploaded
        if ($request->hasFile('image')) {

            // Delete old image
            if ($competition->image && Storage::disk('public')->exists($competition->image)) {
                Storage::disk('public')->delete($competition->image);
            }

            // Store new image
            $validated['image'] = $request->file('image')->store(
                'competitions',
                'public'
            );
        } else {
            // Keep existing image
            $validated['image'] = $competition->image;
        }

        // Checkbox defaults
        $validated['is_featured'] = $request->boolean('is_featured');
        $validated['team_allowed'] = $request->boolean('team_allowed');
        $validated['certificate_enabled'] = $request->boolean('certificate_enabled');
        $validated['requires_approval'] = $request->boolean('requires_approval');

        // Determine status from the incoming data (not the model's current/stale state)
        $validated['status'] = (new Competition($validated))->computeStatus();

        $oldTitle = $competition->title;

        $competition->update($validated);

        AuditLogger::log(
            action: 'UPDATE',
            table: 'competitions',
            recordId: $competition->id,
            details: "Updated competition '{$oldTitle}' to '{$competition->title}'",
            request: $request
        );

        return redirect()
            ->route('admin.competitions')
            ->with('success', 'Competition updated successfully.');
    }

    public function destroy(Request $request, Competition $competition)
    {
        if ($competition->image && Storage::disk('public')->exists($competition->image)) {
            Storage::disk('public')->delete($competition->image);
        }

        $competitionId = $competition->id;
        $competitionTitle = $competition->title;

        $competition->delete();

        AuditLogger::log(
            action: 'DELETE',
            table: 'competitions',
            recordId: $competitionId,
            details: "Deleted competition '{$competitionTitle}'",
            request: $request
        );

        return redirect()
            ->route('admin.competitions')
            ->with('success', 'Competition deleted successfully.');
    }

    public function storeCriterion(Request $request, Competition $competition)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'max_score' => 'required|integer|min:1',
        ]);

        $data = [
            'name' => $validated['name'],
            'max_score' => $validated['max_score'],
            'competition_id' => $competition->id,
        ];

        $criterion = CompetitionScoreCriterion::create($data);

        AuditLogger::log(
            action: 'CREATE',
            table: 'competition_score_criteria',
            recordId: $criterion->id,
            details: "Added judging criterion '{$criterion->name}' (Maximum Score: {$criterion->max_score}) to competition '{$competition->title}'.",
            request: $request
        );

        return back()->with('success', 'Judging criterion added successfully.');
    }

    public function addParticipantToPrivateCompetition(Request $request, $id)
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
            'username' => ['required', 'string', 'exists:users,username'],
        ]);

        $competition = Competition::findOrFail($id);

        $user = User::where('email', $validated['email'])
            ->where('username', $validated['username'])
            ->first();

        if (!$user) {
            return back()->with('error', 'The email and username do not belong to the same user.');
        }

        $existingParticipant = CompetitionParticipant::where('competition_id', $id)
            ->where('participant_id', $user->id)
            ->exists();

        if ($existingParticipant) {
            return back()->with('error', 'This user is already a participant in this competition.');
        }

        $participant = CompetitionParticipant::create([
            'competition_id' => $id,
            'participant_id' => $user->id,
            'status' => 'joined',
        ]);

        AuditLogger::log(
            action: 'CREATE',
            table: 'competition_participants',
            recordId: $participant->id,
            details: "Added user '{$user->username}' (ID: {$user->id}) to private competition '{$competition->title}' (ID: {$competition->id})",
            request: $request
        );

        return back()->with('success', 'Participant added to the competition successfully.');
    }
}
