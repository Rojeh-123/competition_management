<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Notification;

class NotificationController extends Controller
{
    public function index()
    {
        $notifications = Notification::with('user')
            ->where('user_id', Auth::id())
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('participant/NotificationsPage', [
            'notifications' => $notifications,
        ]);
    }

    public function markAsRead(Notification $notification)
    {
        abort_unless($notification->user_id === Auth::id(), 403);

        $notification->markAsRead();

        return back()->with('success', 'Notification marked as read.');
    }

    public function markAsUnread(Notification $notification)
    {
        abort_unless($notification->user_id === Auth::id(), 403);

        $notification->markAsUnread();

        return back()->with('success', 'Notification marked as unread.');
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', Auth::id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return back()->with('success', 'All notifications marked as read.');
    }

    public function destroy(Notification $notification)
    {
        abort_unless($notification->user_id === Auth::id(), 403);

        $notification->delete();

        return back()->with('success', 'Notification deleted.');
    }

    public function markManyRead(Request $request)
    {
        $ids = $this->validatedIds($request);

        Notification::where('user_id', Auth::id())
            ->whereIn('id', $ids)
            ->update(['is_read' => true]);

        return back()->with('success', count($ids) . ' notification(s) marked as read.');
    }

    public function markManyUnread(Request $request)
    {
        $ids = $this->validatedIds($request);

        Notification::where('user_id', Auth::id())
            ->whereIn('id', $ids)
            ->update(['is_read' => false]);

        return back()->with('success', count($ids) . ' notification(s) marked as unread.');
    }

    public function destroyMany(Request $request)
    {
        $ids = $this->validatedIds($request);

        Notification::where('user_id', Auth::id())
            ->whereIn('id', $ids)
            ->delete();

        return back()->with('success', count($ids) . ' notification(s) deleted.');
    }

    private function validatedIds(Request $request): array
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:notifications,id'],
        ]);

        return $validated['ids'];
    }
}
