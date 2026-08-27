<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Helpers\AuditLogger;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Hash;

class AuthenticatedSessionController extends Controller
{
    public function create(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return match (Auth::user()->role) {
                'admin' => redirect()->route('admin.dashboard'),
                'judge' => redirect()->route('judge.dashboard'),
                default => redirect()->route('participant.dashboard'),
            };
        }

        return Inertia::render('AuthPages');
    }

    public function register(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'max:255', 'unique:users,email'],
            'username'   => ['required', 'string', 'max:255', 'unique:users,username'],
            'password'   => ['required', 'string', 'min:8', 'confirmed'],
            'country'    => ['required', 'string', 'max:255'],
            'age'        => ['nullable', 'integer', 'min:1', 'max:120'],
            'bio'        => ['nullable', 'string', 'max:1000'],
        ]);

        $user = User::create([
            'full_name' => trim($validated['first_name'] . ' ' . $validated['last_name']),
            'email' => $validated['email'],
            'username' => $validated['username'],
            'password' => Hash::make($validated['password']),
            'country' => $validated['country'],
            'age' => $validated['age'] ?? null,
            'bio' => $validated['bio'] ?? null,
            'role' => 'participant',
            'account_status' => 'active',
        ]);

        AuditLogger::log(
            action: 'CREATE',
            table: 'users',
            recordId: $user->id,
            details: "New participant account created for '{$user->full_name}' (Username: {$user->username}, Email: {$user->email}).",
            request: $request
        );

        return redirect()->route('login')
            ->with('success', 'Account created successfully.');
    }

    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        $user = Auth::user();

        AuditLogger::log(
            action: 'LOGIN',
            table: 'users',
            recordId: $user->id,
            details: "User '{$user->full_name}' ({$user->username}) logged into the system.",
            request: $request
        );

        return redirect()->route('home')->with('success', 'Logged in successfully.');
    }

    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();

        AuditLogger::log(
            action: 'LOGOUT',
            table: 'users',
            recordId: $user?->id,
            details: "User '{$user?->full_name}' ({$user?->username}) logged out of the system.",
            request: $request
        );

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/')->with('success', 'Logged out successfully.');
    }
}
