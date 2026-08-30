<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\SubmissionFile;
use App\Models\Notification;
use Illuminate\Support\Facades\Storage;
use App\Helpers\AuditLogger;

class SubmissionController extends Controller
{
    public function index()
    {
        $submissions = Submission::with(['competition', 'participant'])
            ->latest()
            ->get()
            ->map(function (Submission $submission) {
                return [
                    'id' => $submission->id,
                    'title' => $submission->title ?? 'Untitled submission',
                    'description' => $submission->description ?? 'No description provided.',
                    'competitionId' => $submission->competition_id,
                    'status' => $submission->status ?? 'pending',
                    'createdAt' => $submission->created_at?->toDateString(),
                    'competitionTitle' => $submission->competition?->title ?? 'Unassigned competition',
                    'participantName' => $submission->participant?->full_name ?? $submission->participant?->username ?? 'Unknown participant',
                    'participantEmail' => $submission->participant?->email ?? null,
                    'versionNumber' => $submission->version_number ?? 1,
                    'isPublic' => (bool) $submission->is_public,
                ];
            });

        return Inertia::render('admin/ManageSubmissionsPage', [
            'user' => Auth::user(),
            'submissions' => $submissions,
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function show(Submission $submission)
    {
        $submission->load(['competition.scoreCriteria', 'competition.judges', 'participant', 'category', 'files', 'scores.judge']);

        return Inertia::render('admin/SubmissionReviewPage', [
            'submission' => [
                'id' => $submission->id,
                'title' => $submission->title ?? 'Untitled submission',
                'description' => $submission->description ?? 'No description provided.',
                'status' => $submission->status ?? 'pending',
                'competitionId' => $submission->competition_id,
                'competitionTitle' => $submission->competition?->title ?? 'Unassigned competition',
                'competitionRules' => $submission->competition?->rules ?? 'No special rules were provided for this competition.',
                'participantId' => $submission->participant_id,
                'participantName' => $submission->participant?->full_name ?? $submission->participant?->username ?? 'Unknown participant',
                'participantEmail' => $submission->participant?->email ?? null,
                'participantPastSubmissions' => $submission->participant?->submissions()->count() ?? 0,
                'categoryId' => $submission->category_id,
                'categoryName' => $submission->category?->name ?? 'Unassigned category',
                'versionNumber' => $submission->version_number ?? 1,
                'isPublic' => (bool) $submission->is_public,
                'createdAt' => $submission->created_at?->format('Y-m-d H:i:s'),
                'updatedAt' => $submission->updated_at?->format('Y-m-d H:i:s'),
                'files' => $submission->files->map(fn ($file) => [
                    'id' => $file->id,
                    'fileName' => $file->file_name ?? 'Uploaded file',
                    'filePath' => $file->file_path,
                    'fileType' => $file->file_type,
                    'fileSize' => $file->file_size,
                ])->values(),
                'criteria' => $submission->competition?->scoreCriteria?->map(fn ($criterion) => [
                    'id' => $criterion->id,
                    'name' => $criterion->name,
                    'maxScore' => (float) $criterion->max_score,
                    'weight' => $criterion->weight,
                ])->values() ?? [],
                'judges' => $submission->competition?->judges?->map(fn ($judge) => [
                    'id' => $judge->id,
                    'name' => $judge->full_name ?? $judge->username ?? $judge->name,
                    'email' => $judge->email,
                ])->values() ?? [],
                'scores' => $submission->scores->map(fn ($score) => [
                    'id' => $score->id,
                    'judgeName' => $score->judge?->full_name ?? $score->judge?->username ?? 'Judge',
                    'score' => (float) $score->score,
                    'feedback' => $score->feedback,
                ])->values(),
            ],
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function approve(Request $request, Submission $submission)
    {
        $submission->update([
            'status' => 'approved'
        ]);

        Notification::create([
            'user_id'    => $submission->participant_id,
            'title'      => 'Submission Approved: ' . $submission->title,
            'message'    => 'Your submission "' . $submission->title . '" has been approved and sent to the judging queue.',
            'priority'   => 1,
            'source'     => 'submission_status',
            'is_read'    => false,
            'image'      => null,
            'created_at' => now(),
        ]);

        AuditLogger::log(
            action: 'UPDATE',
            table: 'submissions',
            recordId: $submission->id,
            details: "Approved submission '{$submission->title}'",
            request: $request
        );

        return redirect()->route('admin.submissions.show', $submission)
            ->with('success', 'Submission approved and sent to the judging queue.');
    }

    public function reject(Submission $submission, Request $request)
    {
        $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $submission->update([
            'status' => 'rejected'
        ]);

        Notification::create([
            'user_id'    => $submission->participant_id,
            'title'      => 'Submission Rejected: ' . $submission->title,
            'message'    => 'Your submission "' . $submission->title . '" was rejected. Reason: ' . $request->reason,
            'priority'   => 1,
            'source'     => 'submission_status',
            'is_read'    => false,
            'image'      => null,
            'created_at' => now(),
        ]);

        AuditLogger::log(
            action: 'UPDATE',
            table: 'submissions',
            recordId: $submission->id,
            details: "Rejected submission '{$submission->title}'. Reason: {$request->reason}",
            request: $request
        );

        return redirect()
            ->route('admin.submissions.show', $submission)
            ->with('success', 'Submission rejected.');
    }

    public function destroy(Request $request, Submission $submission)
    {
        foreach ($submission->files as $file) {
            if (!empty($file->file_path)) {
                Storage::disk('public')->delete($file->file_path);
            }

            $file->delete();
        }

        $submissionId = $submission->id;
        $submissionTitle = $submission->title;

        $submission->delete();

        AuditLogger::log(
            action: 'DELETE',
            table: 'submissions',
            recordId: $submissionId,
            details: "Deleted submission '{$submissionTitle}'",
            request: $request
        );

        return redirect()
            ->route('admin.submissions')
            ->with('success', 'Submission removed.');
    }

    public function return(Request $request, Submission $submission)
    {
        $submission->update([
            'status' => 'pending',
            'rejection_reason' => null,
        ]);

        AuditLogger::log(
            action: 'UPDATE',
            table: 'submissions',
            recordId: $submission->id,
            details: "Returned submission '{$submission->title}' to pending",
            request: $request
        );

        return redirect()
            ->route('admin.submissions.show', $submission)
            ->with('success', 'Submission returned to pending.');
    }

    public function download(SubmissionFile $file)
    {
        return Storage::disk('public')->download(
            $file->file_path,
            $file->file_name
        );
    }
}
