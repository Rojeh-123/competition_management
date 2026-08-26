<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Notification;
use App\Models\User;
use App\Helpers\AuditLogger;

class AnnouncementController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/AnnouncementsPage');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target_group' => 'required|in:all,participants,judges',
            'priority' => 'required|in:low,medium,high',
        ]);

        $query = User::query()->where('role', '!=', 'admin');

        if ($validated['target_group'] !== 'all') {
            $query->where('role', rtrim($validated['target_group'], 's'));
        }

        $userIds = $query->pluck('id');

        if ($userIds->isEmpty()) {
            return redirect()->back()->with('error', 'No users found for the selected audience.');
        }

        $now = now();

        $userIds->chunk(500)->each(function ($chunk) use ($validated, $now) {
            Notification::insert(
                $chunk->map(fn($userId) => [
                    'user_id' => $userId,
                    'title' => $validated['title'],
                    'message' => $validated['message'],
                    'priority' => $validated['priority'] == "low" ? "1" : ($validated['priority'] == "medium" ? "2" : "3"),
                    'is_read' => false,
                    'created_at' => $now,
                ])->toArray()
            );
        });

        AuditLogger::log(
            action: 'CREATE',
            table: 'notifications',
            recordId: null,
            details: "Broadcast announcement '{$validated['title']}' sent to '{$validated['target_group']}' ({$userIds->count()} users).",
            request: $request
        );

        return redirect()->route('admin.announcements')
            ->with('success', "Announcement sent to {$userIds->count()} user(s).");
    }
}
