<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Competition;
use App\Models\Submission;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $totalUsers = User::count();

        $activeCompetitions = Competition::where(
            'status',
            'open'
        )->count();

        $completedCompetitions = Competition::where(
            'status',
            'archived'
        )->count();

        $upcomingCompetitions = Competition::where(
            'status',
            'upcoming'
        )->count();

        $judgingCompetitions = Competition::where(
            'status',
            'judging'
        )->count();

        $winnersAnnounced = Competition::where(
            'status',
            'results_published'
        )->count();

        $submissionClosed = Competition::where(
            'status',
            'submission_closed'
        )->count();

        $totalSubmissions = Submission::count();

        $pendingSubmissions = Submission::where(
            'status',
            'pending'
        )->count();

        $totalJudges = User::where('role', 'judge')->count();

        $newUsersThisMonth = User::whereMonth(
            'created_at',
            now()->month
        )->count();

        $submissionsToday = Submission::whereDate(
            'created_at',
            today()
        )->count();


        /*
        |--------------------------------------------------------------------------
        | Monthly Growth
        |--------------------------------------------------------------------------
        */

        $monthlyGrowth = [];

        for ($i = 5; $i >= 0; $i--) {

            $date = Carbon::now()->subMonths($i);

            $users = User::whereYear(
                'created_at',
                $date->year
            )
                ->whereMonth(
                    'created_at',
                    $date->month
                )
                ->count();


            $submissions = Submission::whereYear(
                'created_at',
                $date->year
            )
                ->whereMonth(
                    'created_at',
                    $date->month
                )
                ->count();


            $monthlyGrowth[] = [
                'month' => $date->format('M'),
                'users' => $users,
                'submissions' => $submissions,
            ];
        }


        /*
        |--------------------------------------------------------------------------
        | Participation by Country
        |--------------------------------------------------------------------------
        */

        $countries = User::selectRaw("
                COALESCE(country,'Unknown') as country,
                COUNT(*) as total
            ")
            ->groupBy('country')
            ->get();

        $overall = max(User::count(), 1);

        $participationByCountry = $countries->map(function ($country) use ($overall) {

            return [
                'country' => $country->country,
                'percentage' => round(
                    ($country->total / $overall) * 100,
                    1
                ),
            ];
        })->values();


        /*
        |--------------------------------------------------------------------------
        | Recent Activities
        |--------------------------------------------------------------------------
        */

        $recentActivities = Submission::with([
            'participant',
            'competition',
        ])
            ->latest()
            ->take(5)
            ->get()
            ->map(function ($submission) {

                return [
                    'message' => ($submission->participant?->full_name ?? $submission->participant?->username ?? 'Someone')
                        . ' submitted to ' . ($submission->competition?->title ?? 'a competition'),

                    'date' => $submission
                        ->created_at
                        ->diffForHumans(),
                ];
            });

        return Inertia::render(
            'admin/AdminDashboard',
            [
                'stats' => [

                    'totalUsers' => $totalUsers,
                    'activeCompetitions' => $activeCompetitions,
                    'completedCompetitions' => $completedCompetitions,

                    'totalSubmissions' => $totalSubmissions,
                    'pendingSubmissions' => $pendingSubmissions,

                    'totalJudges' => $totalJudges,
                    'newUsersThisMonth' => $newUsersThisMonth,

                    'submissionsToday' => $submissionsToday,

                    'upcomingCompetitions' => $upcomingCompetitions,
                    'judgingCompetitions' => $judgingCompetitions,

                    'winnersAnnounced' => $winnersAnnounced,

                    'submissionClosed' => $submissionClosed,

                    'monthlyGrowth' => $monthlyGrowth,

                    'participationByCountry' => $participationByCountry,

                    'recentActivities' => $recentActivities,
                ],
            ]
        );
    }
}