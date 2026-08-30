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
    protected array $priorityLabels = [
        '1' => 'low',
        '2' => 'medium',
        '3' => 'high',
    ];

    public function index()
    {
        $announcements = Notification::query()
            ->where('source', 'admin')
            ->select('title', 'message', 'image', 'priority', 'created_at')
            ->selectRaw('COUNT(*) as recipient_count')
            ->groupBy('title', 'message', 'image', 'priority', 'created_at')
            ->orderByDesc('created_at')
            ->paginate(15)
            ->through(fn($item) => [
                'title' => $item->title,
                'message' => $item->message,
                'image' => $item->image ? asset('storage/' . $item->image) : null,
                'image_path' => $item->image,
                'priority' => $this->priorityLabels[$item->priority] ?? 'low',
                'priority_raw' => $item->priority,
                'recipient_count' => $item->recipient_count,
                'created_at' => $item->created_at,
            ]);

        return Inertia::render('admin/AnnouncementsPage', [
            'announcements' => $announcements,
        ]);
    }

    public function create()
    {
        return Inertia::render('admin/CreateAnnouncementPage');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'target_group' => 'required|in:all,participants,judges',
            'priority' => 'required|in:low,medium,high',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
        ]);

        $query = User::query()->where('role', '!=', 'admin');

        if ($validated['target_group'] !== 'all') {
            $query->where('role', rtrim($validated['target_group'], 's'));
        }

        $userIds = $query->pluck('id');

        if ($userIds->isEmpty()) {
            return redirect()->back()->with(
                'error',
                'No users found for the selected audience.'
            );
        }

        $imagePath = null;

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store(
                'notifications',
                'public'
            );
        }

        $now = now();

        $priority = match ($validated['priority']) {
            'low' => '1',
            'medium' => '2',
            'high' => '3',
        };

        $userIds->chunk(500)->each(function ($chunk) use (
            $validated,
            $now,
            $imagePath,
            $priority
        ) {
            Notification::insert(
                $chunk->map(fn($userId) => [
                    'user_id' => $userId,
                    'title' => $validated['title'],
                    'message' => $validated['message'],
                    'image' => $imagePath,
                    'priority' => $priority,
                    'source' => 'admin',
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

        return redirect()
            ->route('admin.announcements')
            ->with(
                'success',
                "Announcement sent to {$userIds->count()} user(s)."
            );
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'message' => 'required|string',
            'priority_raw' => 'required|in:1,2,3',
            'image_path' => 'nullable|string',
            'created_at' => 'required|date',
        ]);

        $query = Notification::query()
            ->where('source', 'admin')
            ->where('title', $validated['title'])
            ->where('message', $validated['message'])
            ->where('priority', $validated['priority_raw'])
            ->where('created_at', $validated['created_at']);

        if (!empty($validated['image_path'])) {
            $query->where('image', $validated['image_path']);
        } else {
            $query->whereNull('image');
        }

        $deleted = $query->delete();

        if ($deleted === 0) {
            return redirect()->back()->with(
                'error',
                'Announcement not found or already deleted.'
            );
        }

        AuditLogger::log(
            action: 'DELETE',
            table: 'notifications',
            recordId: null,
            details: "Deleted announcement '{$validated['title']}' ({$deleted} notification(s) removed).",
            request: $request
        );

        return redirect()
            ->route('admin.announcements')
            ->with(
                'success',
                "Announcement deleted ({$deleted} notification(s) removed)."
            );
    }
}
