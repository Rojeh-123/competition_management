<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Competition;
use Illuminate\Support\Facades\Hash;
use App\Helpers\AuditLogger;
use Illuminate\Support\Facades\Storage;

class JudgeController extends Controller
{
    public function index()
    {
        $judges = User::where('role', 'judge')->get();
        $competitions = Competition::all();
        return Inertia::render('admin/ManageJudgesPage', [
            'judges' => $judges,
            'competitions' => $competitions,
        ]);
    }

    public function assign(User $user)
    {
        abort_unless($user->role === 'judge', 404);
        $currentUser = Auth::user();

        return Inertia::render('admin/AssignJudgePage', [
            'user' => $currentUser,
            'judge' => $user,
            'competitions' => Competition::select(
                'id',
                'title',
                'visibility',
                'status',
                'category_id'
            )
            ->withCount('submissions')
            ->withCount('judges as assignedJudges')
            ->with('category:id,name')
            ->whereIn('status', ['submission_closed', 'open', 'judging', 'upcoming'])
            ->whereDoesntHave('judges', function ($query) use ($user) {
                $query->where('users.id', $user->id);
            })
            ->get()
            ->map(fn ($competition) => [
                'id' => $competition->id,
                'title' => $competition->title,
                'category' => $competition->category->name,
                'visibility' => $competition->visibility,
                'status' => $competition->status,
                'submissions' => $competition->submissions_count,
                'assignedJudges' => $competition->assignedJudges,
            ]),
        ]);
    }

    public function storeAssignment(Request $request, User $user)
    {
        abort_unless($user->role === 'judge', 404);

        $validated = $request->validate([
            'competitions' => ['required', 'array'],
            'competitions.*' => ['exists:competitions,id'],
        ]);

        $user->judgingCompetitions()->syncWithoutDetaching($validated['competitions']);

        AuditLogger::log(
            action: 'CREATE',
            table: 'judge_assignments',
            recordId: $user->id,
            details: "Assigned judge '{$user->full_name}' to " . count($validated['competitions']) . " competition(s)",
            request: $request
        );

        return redirect()
            ->route('admin.judges')
            ->with('success', 'Judge assignments updated successfully.');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'username' => ['required', 'string', 'max:255', 'unique:users,username'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'min:8'],
            'country' => ['nullable', 'string', 'max:255'],
            'age' => ['nullable', 'integer', 'min:1'],
            'bio' => ['nullable', 'string'],
            'role' => ['required', 'in:judge'],
            'account_status' => ['required', 'in:active,disabled'],
        ]);

        $user = User::create([
            'full_name' => $validated['full_name'],
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'country' => $validated['country'] ?? null,
            'age' => $validated['age'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'role' => $validated['role'],
            'account_status' => $validated['account_status'],
        ]);

        AuditLogger::log(
            action: 'CREATE',
            table: 'users',
            recordId: $user->id,
            details: "Created judge '{$user->full_name}'",
            request: $request
        );

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $judge)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $judge->id,
            'email' => 'required|email|max:255|unique:users,email,' . $judge->id,
            'country' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:1|max:120',
            'bio' => 'nullable|string',
            'role' => 'required|in:participant,judge,admin',
            'account_status' => 'required|in:active,disabled',
        ]);

        $oldName = $judge->full_name;

        $judge->update($validated);

        AuditLogger::log(
            action: 'UPDATE',
            table: 'users',
            recordId: $judge->id,
            details: "Updated judge '{$oldName}' to '{$judge->full_name}'",
            request: $request
        );

        return back()->with('success', 'Judge updated successfully.');
    }

    public function destroy(Request $request, User $judge)
    {
        $judgeId = $judge->id;
        $judgeName = $judge->full_name;

        if ($judge->image) {
            Storage::disk('public')->delete($judge->image);
        }

        $judge->delete();

        AuditLogger::log(
            action: 'DELETE',
            table: 'users',
            recordId: $judgeId,
            details: "Deleted judge '{$judgeName}'",
            request: $request
        );

        return back()->with('success', 'Judge deleted successfully.');
    }
}
