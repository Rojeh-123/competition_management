<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Auth Controllers
use App\Http\Controllers\Auth\AuthenticatedSessionController;

// Public Controllers
use App\Http\Controllers\CompetitionController;
use App\Http\Controllers\GalleryController;
use App\Http\Controllers\MessageController;

// User Controllers
use App\Http\Controllers\User\CompetitionController as UserCompetitionController;
use App\Http\Controllers\User\SubmissionController as UserSubmissionController;
use App\Http\Controllers\User\CertificateController as UserCertificateController;
use App\Http\Controllers\User\TeamController as UserTeamController;
use App\Http\Controllers\User\ExamController;

// Judge Controllers
use App\Http\Controllers\Judge\CompetitionController as JudgeCompetitionController;
use App\Http\Controllers\Judge\SubmissionController as JudgeSubmissionController;
use App\Http\Controllers\Judge\ScoreController as JudgeScoreController;

// Admin Controllers
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\Admin\CompetitionController as AdminCompetitionController;
use App\Http\Controllers\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Admin\JudgeController as AdminJudgeController;
use App\Http\Controllers\Admin\SubmissionController as AdminSubmissionController;
use App\Http\Controllers\Admin\TeamController as AdminTeamController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\AnnouncementController;
use App\Http\Controllers\Admin\AuditLogController;
use App\Http\Controllers\Admin\QuestionBankController;

// Settings Controllers
use App\Http\Controllers\Settings\ProfileController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/', [CompetitionController::class, 'home'])
    ->name('home');

Route::get('/competitions', [CompetitionController::class, 'index'])
    ->name('competitions.index');

Route::get('/competitions/{id}', [CompetitionController::class, 'show'])
    ->name('competitions.show');

Route::get('/winners', [CompetitionController::class, 'winners'])
    ->name('winners');

Route::get('/gallery', [GalleryController::class, 'index'])
    ->name('gallery');

Route::get('/about', [CompetitionController::class, 'about'])
    ->name('about');

Route::post('/gallery/vote', [GalleryController::class, 'vote'])
    ->name('gallery.vote');

/*
|--------------------------------------------------------------------------
| Contact ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/contact', [MessageController::class, 'contact'])
    ->name('contact');

Route::post('/contact', [MessageController::class, 'store'])
    ->name('contact.store');

/*
|--------------------------------------------------------------------------
| AUTH ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/login', [AuthenticatedSessionController::class, 'create'])
    ->name('login');

Route::post('/register', [AuthenticatedSessionController::class, 'register'])
    ->name('register');

Route::post('/login-store', [AuthenticatedSessionController::class, 'store'])
    ->name('login.store');

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
    ->name('logout');

/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware(['auth', 'status'])->group(function () {

    Route::get('/submissions/download/{file}', [AdminSubmissionController::class, 'download'])
        ->name('submissions.download');


    /*|--------------------------------------------------------------------------
    | Notifications ROUTES
    |--------------------------------------------------------------------------
    */

    Route::get('/notifications', [NotificationController::class, 'index'])
        ->name('notifications');

    Route::patch('notifications/read-many', [NotificationController::class, 'markManyRead'])
        ->name('notifications.readMany');

    Route::patch('notifications/unread-many', [NotificationController::class, 'markManyUnread'])
        ->name('notifications.unreadMany');

    Route::delete('notifications/destroy-many', [NotificationController::class, 'destroyMany'])
        ->name('notifications.destroyMany');

    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');

    Route::patch('notifications/{notification}/unread', [NotificationController::class, 'markAsUnread'])
        ->name('notifications.unread');

    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.readAll');

    Route::delete('notifications/{notification}', [NotificationController::class, 'destroy'])
        ->name('notifications.destroy');

    /*
    |--------------------------------------------------------------------------
    | PROFILE (ALL USERS)
    |--------------------------------------------------------------------------
    */

    Route::get('/profile/{id}', [ProfileController::class, 'show'])
        ->name('profile');

    Route::get('/edit-profile', [ProfileController::class, 'editProfile'])
        ->name('edit-profile');

    Route::post('/update-profile', [ProfileController::class, 'updateProfile'])
        ->name('profile.update');

    Route::delete('/delete-profile', [ProfileController::class, 'deleteProfile'])
        ->name('profile.delete');

    /*
    |--------------------------------------------------------------------------
    | PARTICIPANT ROUTES
    |--------------------------------------------------------------------------
    */

    Route::prefix('participant')
        ->name('participant.')
        ->middleware(['role:participant'])
        ->group(function () {


            /*|--------------------------------------------------------------------------
            | DashBoard Section
            |--------------------------------------------------------------------------
            */

            Route::get('/dashboard', [UserCompetitionController::class, 'dashboard'])
                ->name('dashboard');


            /*|--------------------------------------------------------------------------
            | Competitions ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/competitions', [UserCompetitionController::class, 'myCompetitions'])
                ->name('competitions');

            Route::post('/competitions/join-competition/{id}', [UserCompetitionController::class, 'joinCompetition'])
                ->name('competitions.join');

            Route::post('/competitions/leave-competition/{id}', [UserCompetitionController::class, 'leaveCompetition'])
                ->name('competitions.leave');


            /*|--------------------------------------------------------------------------
            | Submissions ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/submit/{competitionId}/{teamId?}', [UserSubmissionController::class, 'create'])
                ->name('submit');

            Route::post('/submit/store/{teamId?}', [UserSubmissionController::class, 'store'])
                ->name('submissions.store');


            /*|--------------------------------------------------------------------------
            | Teams MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/teams', [UserTeamController::class, 'myTeams'])
                ->name('teams');

            Route::get('/teams/{team}', [UserTeamController::class, 'show'])
                ->name('teams.show');


            /*|--------------------------------------------------------------------------
            | Question Bank ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/participant/competitions/{competition}/question-bank', [ExamController::class, 'questionBank'])
                ->name('competitions.question-bank');

            Route::get('/participant/competitions/{competition}/exam', [ExamController::class, 'showExam'])
                ->name('competitions.exam');

            Route::post('/participant/competitions/{competition}/exam/save', [ExamController::class, 'saveAnswers'])
                ->name('competitions.exam.save');

            Route::post('/participant/competitions/{competition}/exam/submit', [ExamController::class, 'submit'])
                ->name('competitions.exam.submit');

            /*|--------------------------------------------------------------------------
            | Certificates ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/certificates', [UserCertificateController::class, 'index'])
                ->name('certificates');
        });

    /*
    |--------------------------------------------------------------------------
    | ADMIN ROUTES
    |--------------------------------------------------------------------------
    */

    Route::prefix('admin')
        ->name('admin.')
        ->middleware(['role:admin'])
        ->group(function () {


            /*|--------------------------------------------------------------------------
            | DashBoard Section
            |--------------------------------------------------------------------------
            */

            Route::get('/dashboard', [DashboardController::class, 'index'])
                ->name('dashboard');


            /*|--------------------------------------------------------------------------
            | Users MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/users', [AdminUserController::class, 'index'])
                ->name('users');

            Route::get('/users/{user}', [ProfileController::class, 'show'])
                ->name('users.show');

            Route::post('/users', [AdminUserController::class, 'store'])
                ->name('users.store');

            Route::put('/users/{user}', [AdminUserController::class, 'update'])
                ->name('users.update');

            Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])
                ->name('users.destroy');


            /*|--------------------------------------------------------------------------
            | Competitions MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/competitions', [AdminCompetitionController::class, 'index'])
                ->name('competitions');

            Route::get('/competitions/create', [AdminCompetitionController::class, 'create'])
                ->name('competitions.create');

            Route::get('/competitions/{competition}', [AdminCompetitionController::class, 'show'])
                ->name('competitions.show');

            Route::post('/competitions', [AdminCompetitionController::class, 'store'])
                ->name('competitions.store');

            Route::get('/competitions/{competition}/edit', [AdminCompetitionController::class, 'edit'])
                ->name('competitions.edit');

            Route::put('/competitions/{competition}/update', [AdminCompetitionController::class, 'update'])
                ->name('competitions.update');

            Route::delete('/competitions/{competition}/destroy', [AdminCompetitionController::class, 'destroy'])
                ->name('competitions.destroy');

            Route::post('/competitions/{competition}/criteria', [AdminCompetitionController::class, 'storeCriterion'])
                ->name('competitions.criteria.store');

            Route::post('/competitions/{competition}/add-participant-to-private-competition', [AdminCompetitionController::class, 'addParticipantToPrivateCompetition'])
                ->name('competitions.participant.private');

            /*|--------------------------------------------------------------------------
            | Categories MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/categories', [AdminCategoryController::class, 'index'])
                ->name('categories');

            Route::post('/categories', [AdminCategoryController::class, 'store'])
                ->name('categories.store');

            Route::put('/categories/{category}', [AdminCategoryController::class, 'update'])
                ->name('categories.update');

            Route::delete('/categories/{category}', [AdminCategoryController::class, 'destroy'])
                ->name('categories.destroy');


            /*|--------------------------------------------------------------------------
            | Judges MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/judges', [AdminJudgeController::class, 'index'])
                ->name('judges');

            Route::get('/judges/assign/{user}', [AdminJudgeController::class, 'assign'])
                ->name('judges.assign');

            Route::post('/judges', [AdminJudgeController::class, 'store'])
                ->name('judges.store');

            Route::put('/judges/{judge}', [AdminJudgeController::class, 'update'])
                ->name('judges.update');

            Route::delete('/judges/{judge}', [AdminJudgeController::class, 'destroy'])
                ->name('judges.destroy');

            Route::post('/judges/assign/{user}/store', [AdminJudgeController::class, 'storeAssignment'])
                ->name('judges.assign.store');


            /*|--------------------------------------------------------------------------
            | Submissions MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/submissions', [AdminSubmissionController::class, 'index'])
                ->name('submissions');

            Route::get('/submissions/{submission}', [AdminSubmissionController::class, 'show'])
                ->name('submissions.show');

            Route::post('/submissions/{submission}/approve', [AdminSubmissionController::class, 'approve'])
                ->name('submissions.approve');

            Route::post('/submissions/{submission}/reject', [AdminSubmissionController::class, 'reject'])
                ->name('submissions.reject');

            Route::delete('/submissions/{submission}', [AdminSubmissionController::class, 'destroy'])
                ->name('submissions.destroy');

            Route::post('/submissions/{submission}/return', [AdminSubmissionController::class, 'return'])
                ->name('submissions.return');


            /*|--------------------------------------------------------------------------
            | Audit Logs MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/audit-logs', [AuditLogController::class, 'index'])
                ->name('audit-logs');


            /*|--------------------------------------------------------------------------
            | Announcements MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/announcements', [AnnouncementController::class, 'index'])
                ->name('announcements');

            Route::get('/announcements/create', [AnnouncementController::class, 'create'])
                ->name('announcements.create');

            Route::post('/announcements', [AnnouncementController::class, 'store'])
                ->name('announcements.store');

            Route::delete('/announcements', [AnnouncementController::class, 'destroy'])
                ->name('announcements.destroy');

            /*
            |--------------------------------------------------------------------------
            | Messages ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/messages', [MessageController::class, 'index'])
                ->name('messages.index');

            Route::get('/messages/{contact}', [MessageController::class, 'show'])
                ->name('messages.show');

            Route::delete('/messages/{contact}', [MessageController::class, 'destroy'])
                ->name('messages.destroy');


            /*|--------------------------------------------------------------------------
            | Teams MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/teams', [AdminTeamController::class, 'index'])
                ->name('teams');

            Route::get('/teams/create', [AdminTeamController::class, 'create'])
                ->name('teams.create');

            Route::get('/teams/{team}/edit', [AdminTeamController::class, 'edit'])
                ->name('teams.edit');

            Route::post('/teams', [AdminTeamController::class, 'store'])
                ->name('teams.store');

            Route::put('/teams/{team}/update', [AdminTeamController::class, 'update'])
                ->name('teams.update');

            Route::delete('/teams/{team}/destroy', [AdminTeamController::class, 'destroy'])
                ->name('teams.destroy');


            /*|--------------------------------------------------------------------------
            | Question Bank ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/admin/competitions/{competition}/question-bank', [QuestionBankController::class, 'edit'])
                ->name('competitions.question-bank.edit');

            Route::put('/admin/competitions/{competition}/question-bank', [QuestionBankController::class, 'sync'])
                ->name('competitions.question-bank.sync');


            /*|--------------------------------------------------------------------------
            | Reports MANAGEMENT ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/reports', [ReportController::class, 'index'])
                ->name('reports');
        });

    /*
    |--------------------------------------------------------------------------
    | JUDGE ROUTES
    |--------------------------------------------------------------------------
    */

    Route::prefix('judge')
        ->name('judge.')
        ->middleware(['role:judge'])
        ->group(function () {


            /*|--------------------------------------------------------------------------
            | DashBoard Section
            |--------------------------------------------------------------------------
            */

            Route::get('/dashboard', [JudgeCompetitionController::class, 'dashboard'])
                ->name('dashboard');


            /*|--------------------------------------------------------------------------
            | Assigned Competitions ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/competitions', [JudgeCompetitionController::class, 'index'])
                ->name('competitions');

            Route::get('/submissions/{id}', [JudgeCompetitionController::class, 'submissions'])
                ->name('submissions');

            Route::get('/review/{id}', [JudgeSubmissionController::class, 'review'])
                ->name('review');

            Route::post('/evaluations/save-draft', [JudgeScoreController::class, 'saveDraft'])
                ->name('save-draft');

            Route::post('/evaluations/submit', [JudgeScoreController::class, 'submit'])
                ->name('submit-score');

            /*|--------------------------------------------------------------------------
            | History ROUTES
            |--------------------------------------------------------------------------
            */

            Route::get('/history', [JudgeSubmissionController::class, 'history'])
                ->name('history');
        });
});

/*
|--------------------------------------------------------------------------
| FALLBACK
|--------------------------------------------------------------------------
*/

Route::fallback(function () {
    abort(404, 'errors.page_not_found');
});
