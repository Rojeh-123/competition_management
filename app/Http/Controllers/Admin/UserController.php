<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use App\Helpers\AuditLogger;

class UserController extends Controller
{
    public function index()
    {
        $usersList = User::all();
        return Inertia::render('admin/ManageUsersPage', [
            'usersList' => $usersList,
        ]);
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
            'role' => ['required', 'in:participant,judge,admin'],
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
            details: "Created {$user->role} '{$user->full_name}'",
            request: $request
        );

        return back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        if (Auth::id() === $user->id) {
            return back()->with('error', 'You cannot edit your own account from here. Please try again in your profile page.');
        }

        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $user->id,
            'email' => 'required|email|max:255|unique:users,email,' . $user->id,
            'country' => 'nullable|string|max:255',
            'age' => 'nullable|integer|min:1|max:120',
            'bio' => 'nullable|string',
            'role' => 'required|in:participant,judge,admin',
            'account_status' => 'required|in:active,disabled',
        ]);

        $oldName = $user->full_name;
        $oldRole = $user->role;

        $user->update($validated);

        AuditLogger::log(
            action: 'UPDATE',
            table: 'users',
            recordId: $user->id,
            details: "Updated {$oldRole} '{$oldName}'",
            request: $request
        );

        return back()->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        if (Auth::id() === $user->id) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        if ($user->image) {
            Storage::disk('public')->delete($user->image);
        }

        $userId = $user->id;
        $userName = $user->full_name;
        $userRole = $user->role;

        $user->delete();

        AuditLogger::log(
            action: 'DELETE',
            table: 'users',
            recordId: $userId,
            details: "Deleted {$userRole} '{$userName}'",
            request: $request
        );

        return back()->with('success', 'User deleted successfully.');
    }
}
