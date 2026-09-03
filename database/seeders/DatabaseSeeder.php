<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Carbon\Carbon;
use App\Models\User;
use App\Models\Category;
use App\Models\Competition;
use App\Models\CompetitionParticipant;
use App\Models\JudgeAssignment;
use App\Models\Submission;
use App\Models\SubmissionFile;
use App\Models\CompetitionScoreCriterion;
use App\Models\Score;
use App\Models\CompetitionWinner;
use App\Models\QuestionBank;
use App\Models\Question;
use App\Models\ExamAttempt;
use App\Models\ExamAttemptQuestion;
use App\Models\Team;
use App\Models\Notification;
use App\Models\AuditLog;
use App\Models\Contact;
use App\Models\CompetitionAnnouncement;
use App\Models\Badge;
use App\Models\UserBadge;
use App\Models\SubmissionGalleryStat;
use App\Models\SubmissionVote;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $tables = [
            'users',
            'categories',
            'competitions',
            'competition_participants',
            'judge_assignments',
            'submissions',
            'submission_files',
            'competition_score_criteria',
            'scores',
            'competition_winners',
            'question_banks',
            'questions',
            'exam_attempts',
            'exam_attempt_questions',
            'teams',
            'team_user',
            'notifications',
            'audit_logs',
            'contacts',
            'competition_announcements',
            'user_badges',
            'badges',
            'submission_votes',
            'submission_gallery_stats',
        ];

        foreach ($tables as $table) {
            if (Schema::hasTable($table)) {
                DB::table($table)->truncate();
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ----------------------------------------------------------
        // 1. BADGES
        // ----------------------------------------------------------
        $badgesData = [
            ['slug' => 'first-steps', 'name' => 'First Steps', 'description' => 'Submit your first entry', 'icon' => 'badges_icons/first-steps.png', 'category' => 'milestone', 'points' => 10],
            ['slug' => 'champion', 'name' => 'Champion', 'description' => 'Finish 1st place in a competition', 'icon' => 'badges_icons/champion.png', 'category' => 'performance', 'points' => 100],
            ['slug' => 'podium-finisher', 'name' => 'Podium Finisher', 'description' => 'Finish top 3 in a competition', 'icon' => 'badges_icons/podium-finisher.png', 'category' => 'performance', 'points' => 50],
            ['slug' => 'perfect-score', 'name' => 'Perfect Score', 'description' => 'Receive the highest possible judge score', 'icon' => 'badges_icons/perfect-score.png', 'category' => 'performance', 'points' => 75],
            ['slug' => 'streak-3', 'name' => 'Streak (3)', 'description' => 'Compete in 3 competitions in a row', 'icon' => 'badges_icons/streak-3.png', 'category' => 'participation', 'tier' => 'bronze', 'points' => 20],
            ['slug' => 'streak-5', 'name' => 'Streak (5)', 'description' => 'Compete in 5 competitions in a row', 'icon' => 'badges_icons/streak-5.png', 'category' => 'participation', 'tier' => 'silver', 'points' => 40],
            ['slug' => 'streak-10', 'name' => 'Streak (10)', 'description' => 'Compete in 10 competitions in a row', 'icon' => 'badges_icons/streak-10.png', 'category' => 'participation', 'tier' => 'gold', 'points' => 80],
            ['slug' => 'early-bird', 'name' => 'Early Bird', 'description' => 'Submit within the first hour of a competition opening', 'icon' => 'badges_icons/early-bird.png', 'category' => 'participation', 'points' => 15],
            ['slug' => 'team-player', 'name' => 'Team Player', 'description' => 'Compete as part of a team', 'icon' => 'badges_icons/team-player.png', 'category' => 'participation', 'points' => 15],
            ['slug' => 'veteran', 'name' => 'Veteran', 'description' => 'Active on the platform for 6 months or more', 'icon' => 'badges_icons/veteran.png', 'category' => 'milestone', 'points' => 30],
            ['slug' => 'prolific', 'name' => 'Prolific', 'description' => 'Submit to a high number of competitions total', 'icon' => 'badges_icons/prolific.png', 'category' => 'milestone', 'points' => 40],
        ];
        foreach ($badgesData as $badge) {
            Badge::create($badge);
        }

        // ----------------------------------------------------------
        // 2. USERS
        // ----------------------------------------------------------
        $admin = User::create([
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'username' => 'admin',
            'full_name' => 'System Admin',
            'country' => 'USA',
            'age' => 35,
            'bio' => 'Platform administrator.',
            'role' => 'admin',
            'account_status' => 'active',
            'image' => 'profile_images/admin.jpg',
            'competition_streak' => 0,
        ]);

        $judges = [];
        for ($i = 1; $i <= 5; $i++) {
            $judges[] = User::create([
                'email' => "judge$i@example.com",
                'password' => Hash::make('password'),
                'username' => "judge_$i",
                'full_name' => "Judge $i",
                'country' => ['USA', 'UK', 'Canada', 'Germany', 'France'][$i - 1],
                'age' => rand(30, 60),
                'bio' => "Experienced judge in various fields.",
                'role' => 'judge',
                'account_status' => 'active',
                'image' => null,
                'competition_streak' => 0,
            ]);
        }

        $participants = [];
        for ($i = 1; $i <= 20; $i++) {
            $participants[] = User::create([
                'email' => "participant$i@example.com",
                'password' => Hash::make('password'),
                'username' => "user_$i",
                'full_name' => "Participant $i",
                'country' => ['USA', 'UK', 'Canada', 'Germany', 'France', 'India', 'Brazil', 'Australia', 'Japan', 'Italy'][$i % 10],
                'age' => rand(16, 70),
                'bio' => "Bio of participant $i.",
                'role' => 'participant',
                'account_status' => 'active',
                'image' => null,
                'competition_streak' => rand(0, 5),
            ]);
        }

        // ----------------------------------------------------------
        // 3. CATEGORIES
        // ----------------------------------------------------------
        $categories = [];
        $catNames = ['Photography', 'Design', 'Writing', 'Coding', 'Art', 'Music', 'Film', 'Science', 'Education', 'Business'];
        foreach ($catNames as $name) {
            $categories[] = Category::create([
                'name' => $name,
                'description' => "Category for $name competitions.",
            ]);
        }

        // ----------------------------------------------------------
        // 4. COMPETITIONS – all statuses
        // ----------------------------------------------------------
        $statuses = ['upcoming', 'open', 'submission_closed', 'judging', 'results_published', 'archived'];
        $competitions = [];
        $now = Carbon::now();

        for ($i = 0; $i < count($statuses); $i++) {
            $status = $statuses[$i];
            $count = 3;
            for ($j = 0; $j < $count; $j++) {
                $start = $now->copy()->addDays(($i * 10) + $j * 2);
                $registrationDeadline = $start->copy()->addDays(5);
                $submissionDeadline = $registrationDeadline->copy()->addDays(5);
                $judgingStart = $submissionDeadline->copy()->addDays(2);
                $judgingEnd = $judgingStart->copy()->addDays(5);
                $end = $judgingEnd->copy()->addDays(2);
                $winnerAnnounced = $end->copy()->addDays(1);

                switch ($status) {
                    case 'upcoming':
                        $start = $now->copy()->addDays(10 + $j);
                        $registrationDeadline = $start->copy()->addDays(5);
                        $submissionDeadline = $registrationDeadline->copy()->addDays(5);
                        $judgingStart = $submissionDeadline->copy()->addDays(2);
                        $judgingEnd = $judgingStart->copy()->addDays(5);
                        $end = $judgingEnd->copy()->addDays(2);
                        $winnerAnnounced = $end->copy()->addDays(1);
                        break;
                    case 'open':
                        $start = $now->copy()->subDays(1 + $j);
                        $registrationDeadline = $now->copy()->addDays(2 + $j);
                        $submissionDeadline = $registrationDeadline->copy()->addDays(5);
                        $judgingStart = $submissionDeadline->copy()->addDays(2);
                        $judgingEnd = $judgingStart->copy()->addDays(5);
                        $end = $judgingEnd->copy()->addDays(2);
                        $winnerAnnounced = $end->copy()->addDays(1);
                        break;
                    case 'submission_closed':
                        $start = $now->copy()->subDays(10 + $j);
                        $registrationDeadline = $start->copy()->addDays(5);
                        $submissionDeadline = $now->copy()->subDays(2 + $j);
                        $judgingStart = $submissionDeadline->copy()->addDays(2);
                        $judgingEnd = $judgingStart->copy()->addDays(5);
                        $end = $judgingEnd->copy()->addDays(2);
                        $winnerAnnounced = $end->copy()->addDays(1);
                        break;
                    case 'judging':
                        $start = $now->copy()->subDays(15 + $j);
                        $registrationDeadline = $start->copy()->addDays(5);
                        $submissionDeadline = $registrationDeadline->copy()->addDays(5);
                        $judgingStart = $now->copy()->subDays(2 + $j);
                        $judgingEnd = $now->copy()->addDays(3 + $j);
                        $end = $judgingEnd->copy()->addDays(2);
                        $winnerAnnounced = $end->copy()->addDays(1);
                        break;
                    case 'results_published':
                        $start = $now->copy()->subDays(30 + $j);
                        $registrationDeadline = $start->copy()->addDays(5);
                        $submissionDeadline = $registrationDeadline->copy()->addDays(5);
                        $judgingStart = $submissionDeadline->copy()->addDays(2);
                        $judgingEnd = $judgingStart->copy()->addDays(5);
                        $end = $judgingEnd->copy()->addDays(2);
                        $winnerAnnounced = $now->copy()->subDays(2 + $j);
                        break;
                    case 'archived':
                        $start = $now->copy()->subDays(60 + $j);
                        $registrationDeadline = $start->copy()->addDays(5);
                        $submissionDeadline = $registrationDeadline->copy()->addDays(5);
                        $judgingStart = $submissionDeadline->copy()->addDays(2);
                        $judgingEnd = $judgingStart->copy()->addDays(5);
                        $end = $judgingEnd->copy()->addDays(2);
                        $winnerAnnounced = $end->copy()->addDays(1);
                        break;
                }

                $title = ucfirst($status) . " Competition " . ($j + 1);
                $hasQuestionBank = ($status === 'upcoming' || $status === 'open') && $j % 2 == 0;
                $isFeatured = $j % 2 == 0;
                $isTeamAllowed = $j % 2 == 1;
                $visibility = ($j % 3 == 0) ? 'private' : 'public';

                $comp = Competition::create([
                    'title' => $title,
                    'image' => "competitions/$status-$j.jpg",
                    'category_id' => $categories[($i + $j) % count($categories)]->id,
                    'is_featured' => $isFeatured,
                    'description' => "Description for $title.",
                    'rules' => "Rules for $title.",
                    'start_date' => $start,
                    'registration_deadline' => $registrationDeadline,
                    'published_at' => $start->copy()->subDay(),
                    'submission_deadline' => $submissionDeadline,
                    'judging_start_date' => $judgingStart,
                    'judging_end_date' => $judgingEnd,
                    'end_date' => $end,
                    'winner_announced_at' => $winnerAnnounced,
                    'max_file_size_mb' => 5,
                    'allowed_file_types' => 'jpg,jpeg,png,pdf,zip',
                    'number_of_winners' => 3,
                    'prize_description' => "Prize for $title.",
                    'visibility' => $visibility,
                    'team_allowed' => $isTeamAllowed,
                    'has_question_bank' => $hasQuestionBank,
                    'min_age' => ($j % 2 == 0) ? 18 : null,
                    'max_age' => ($j % 2 == 0) ? 35 : null,
                    'certificate_enabled' => true,
                    'requires_approval' => ($j % 2 == 0) ? true : false,
                    'contact_email' => "contact$i@example.com",
                    'contact_phone' => "+123456789$i",
                    'status' => $status,
                    'created_by' => $admin->id,
                ]);

                $competitions[] = $comp;
            }
        }

        // ----------------------------------------------------------
        // 5. PARTICIPANTS & JUDGE ASSIGNMENTS
        // ----------------------------------------------------------
        foreach ($competitions as $comp) {
            $assignedParticipants = collect($participants)->random(min(10, count($participants)))->pluck('id');
            foreach ($assignedParticipants as $pid) {
                CompetitionParticipant::create([
                    'competition_id' => $comp->id,
                    'participant_id' => $pid,
                    'joined_at' => $comp->start_date->copy()->addDays(rand(0, 5)),
                    'status' => 'joined',
                ]);
            }

            $assignedJudges = collect($judges)->random(rand(2, 3))->pluck('id');
            foreach ($assignedJudges as $jid) {
                JudgeAssignment::create([
                    'competition_id' => $comp->id,
                    'judge_id' => $jid,
                    'assigned_at' => $comp->judging_start_date ?? $comp->submission_deadline,
                ]);
            }

            // Question banks
            if ($comp->has_question_bank) {
                $bank = QuestionBank::create([
                    'competition_id' => $comp->id,
                    'number_of_questions' => 5,
                    'duration_minutes' => 30,
                ]);
                for ($q = 0; $q < 10; $q++) {
                    $correct = ['A', 'B', 'C', 'D'][rand(0, 3)];
                    Question::create([
                        'question_bank_id' => $bank->id,
                        'question_text' => "Question $q for competition {$comp->id}?",
                        'choices' => json_encode([
                            'A' => 'Answer A',
                            'B' => 'Answer B',
                            'C' => 'Answer C',
                            'D' => 'Answer D',
                        ]),
                        'correct_answer' => $correct,
                        'points' => rand(1, 5),
                        'sort_order' => $q,
                    ]);
                }
            }
        }

        // ----------------------------------------------------------
        // 6. SUBMISSIONS & FILES
        // ----------------------------------------------------------
        $submissions = [];
        foreach ($competitions as $comp) {
            $participantsInComp = $comp->participants()->pluck('users.id');
            $submitting = $participantsInComp->random(round($participantsInComp->count() * 0.7))->take(5);
            foreach ($submitting as $pid) {
                $allowedStatuses = [];
                if (in_array($comp->status, ['upcoming', 'open'])) {
                    $allowedStatuses = ['pending', 'approved', 'rejected'];
                } elseif ($comp->status == 'submission_closed') {
                    $allowedStatuses = ['pending', 'approved', 'rejected', 'judging'];
                } elseif ($comp->status == 'judging') {
                    $allowedStatuses = ['approved', 'judging', 'finished'];
                } elseif ($comp->status == 'results_published' || $comp->status == 'archived') {
                    $allowedStatuses = ['approved', 'finished'];
                } else {
                    $allowedStatuses = ['pending'];
                }
                $subStatus = $allowedStatuses[array_rand($allowedStatuses)];

                $sub = Submission::create([
                    'competition_id' => $comp->id,
                    'participant_id' => $pid,
                    'team_id' => null,
                    'category_id' => $comp->category_id,
                    'title' => "Submission for {$comp->title} by User $pid",
                    'description' => "Description of submission.",
                    'status' => $subStatus,
                    'is_public' => $comp->visibility === 'public',
                ]);

                for ($f = 0; $f < rand(2, 3); $f++) {
                    SubmissionFile::create([
                        'submission_id' => $sub->id,
                        'file_name' => "file_$f.txt",
                        'file_path' => "submissions/file_$f.txt",
                        'file_type' => 'text/plain',
                        'file_size' => rand(100, 5000),
                    ]);
                }
                $submissions[] = $sub;
            }
        }

        // ----------------------------------------------------------
        // 7. SCORE CRITERIA & SCORES
        // ----------------------------------------------------------
        foreach ($competitions as $comp) {
            if (in_array($comp->status, ['judging', 'results_published', 'archived'])) {
                $criteriaNames = ['Creativity', 'Technical Skill', 'Presentation', 'Originality', 'Impact'];
                $criteria = [];
                for ($c = 0; $c < rand(3, 5); $c++) {
                    $crit = CompetitionScoreCriterion::create([
                        'competition_id' => $comp->id,
                        'name' => $criteriaNames[$c % count($criteriaNames)],
                        'max_score' => rand(10, 25),
                    ]);
                    $criteria[] = $crit;
                }

                $subs = $comp->submissions()->whereIn('status', ['approved', 'judging', 'finished'])->get();
                $judgeIds = $comp->judges()->pluck('users.id');

                foreach ($subs as $sub) {
                    foreach ($judgeIds as $jid) {
                        if (rand(0, 1)) {
                            $isLocked = rand(0, 1);
                            foreach ($criteria as $crit) {
                                Score::create([
                                    'submission_id' => $sub->id,
                                    'judge_id' => $jid,
                                    'criterion_id' => $crit->id,
                                    'score' => rand(1, $crit->max_score),
                                    'comment' => 'Judge comment for criterion ' . $crit->name,
                                    'status' => $isLocked ? 'Locked' : 'In Draft',
                                ]);
                            }
                        }
                    }
                }
            }
        }

        // ----------------------------------------------------------
        // 8. WINNERS (without certificates)
        // ----------------------------------------------------------
        $resultsPublishedComps = Competition::where('status', 'results_published')->get();
        foreach ($resultsPublishedComps as $comp) {
            $submissionsWithScores = $comp->submissions()
                ->with('scores')
                ->get()
                ->map(function ($sub) {
                    $total = $sub->scores->where('status', 'Locked')->sum('score');
                    return ['submission' => $sub, 'total' => $total];
                })
                ->sortByDesc('total')
                ->take($comp->number_of_winners)
                ->values();

            $rank = 1;
            foreach ($submissionsWithScores as $item) {
                $sub = $item['submission'];
                CompetitionWinner::create([
                    'competition_id' => $comp->id,
                    'submission_id' => $sub->id,
                    'participant_id' => $sub->participant_id,
                    'rank_position' => $rank,
                    'final_score' => $item['total'],
                ]);
                $rank++;
            }
        }

        // ----------------------------------------------------------
        // 9. TEAMS
        // ----------------------------------------------------------
        $teamCompetitions = Competition::where('team_allowed', true)->take(3)->get();
        foreach ($teamCompetitions as $comp) {
            for ($t = 0; $t < 2; $t++) {
                $team = Team::create([
                    'name' => "Team " . $comp->id . "-" . ($t + 1),
                    'competition_id' => $comp->id,
                ]);

                $members = $comp->participants()->inRandomOrder()->take(rand(3, 4))->pluck('users.id');
                foreach ($members as $mid) {
                    DB::table('team_user')->insert([
                        'team_id' => $team->id,
                        'user_id' => $mid,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }

                $teamLeader = $members->first();
                if ($teamLeader) {
                    $sub = Submission::create([
                        'competition_id' => $comp->id,
                        'participant_id' => null,
                        'team_id' => $team->id,
                        'category_id' => $comp->category_id,
                        'title' => "Team submission for " . $team->name,
                        'description' => "Team entry description.",
                        'status' => 'pending',
                        'is_public' => $comp->visibility === 'public',
                    ]);
                    SubmissionFile::create([
                        'submission_id' => $sub->id,
                        'file_name' => 'team_file.txt',
                        'file_path' => 'submissions/team_file.txt',
                        'file_type' => 'text/plain',
                        'file_size' => 1024,
                    ]);
                }
            }
        }

        // ----------------------------------------------------------
        // 10. NOTIFICATIONS
        // ----------------------------------------------------------
        $announcements = [
            ['title' => 'Welcome to the platform', 'message' => 'We are excited to have you.', 'priority' => '1'],
            ['title' => 'New competition open', 'message' => 'Check out our latest competition.', 'priority' => '2'],
            ['title' => 'System maintenance', 'message' => 'Downtime expected this weekend.', 'priority' => '3'],
        ];
        foreach ($announcements as $ann) {
            $users = User::all();
            foreach ($users as $user) {
                Notification::create([
                    'user_id' => $user->id,
                    'title' => $ann['title'],
                    'message' => $ann['message'],
                    'priority' => $ann['priority'],
                    'source' => 'admin',
                    'is_read' => rand(0, 1),
                    'image' => null,
                ]);
            }
        }

        $badges = Badge::all();
        foreach ($participants as $p) {
            if (rand(0, 1)) {
                $badge = $badges->random();
                Notification::create([
                    'user_id' => $p->id,
                    'title' => 'Achievement Unlocked: ' . $badge->name,
                    'message' => $badge->description,
                    'priority' => '1',
                    'source' => 'badge',
                    'is_read' => rand(0, 1),
                    'image' => $badge->icon,
                ]);
            }
        }

        foreach ($competitions as $comp) {
            if (in_array($comp->status, ['open', 'judging', 'results_published'])) {
                $partIds = $comp->participants()->pluck('users.id');
                foreach ($partIds as $pid) {
                    Notification::create([
                        'user_id' => $pid,
                        'title' => "Competition Update: {$comp->title}",
                        'message' => "The competition is now {$comp->status}.",
                        'priority' => '1',
                        'source' => 'status_change',
                        'is_read' => rand(0, 1),
                        'image' => null,
                    ]);
                }
            }
        }

        // ----------------------------------------------------------
        // 11. AUDIT LOGS
        // ----------------------------------------------------------
        $actions = ['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'SUBMIT'];
        $tables = ['users', 'competitions', 'submissions', 'scores', 'teams'];
        for ($i = 0; $i < 50; $i++) {
            AuditLog::create([
                'user_id' => User::all()->random()->id,
                'action' => $actions[array_rand($actions)],
                'table_name' => $tables[array_rand($tables)],
                'record_id' => rand(1, 100),
                'details' => 'Audit log entry ' . $i,
                'ip_address' => '127.0.0.1',
                'created_at' => now()->subDays(rand(0, 30)),
            ]);
        }

        // ----------------------------------------------------------
        // 12. CONTACTS
        // ----------------------------------------------------------
        for ($i = 0; $i < 5; $i++) {
            Contact::create([
                'contact' => 'user' . $i . '@example.com',
                'subject' => 'Subject ' . $i,
                'message' => 'Message ' . $i,
                'is_read' => rand(0, 1),
            ]);
        }

        // ----------------------------------------------------------
        // 13. SUBMISSION VOTES & GALLERY STATS
        // ----------------------------------------------------------
        foreach ($submissions as $sub) {
            if ($sub->is_public) {
                $voters = User::inRandomOrder()->take(rand(0, 5))->pluck('id');
                foreach ($voters as $vid) {
                    DB::table('submission_votes')->insert([
                        'user_id' => $vid,
                        'submission_id' => $sub->id,
                        'created_at' => now(),
                    ]);
                }
                SubmissionGalleryStat::create([
                    'submission_id' => $sub->id,
                    'impressions' => rand(0, 100),
                    'likes' => rand(0, 20),
                    'dislikes' => rand(0, 5),
                    'last_shown_at' => now()->subHours(rand(0, 48)),
                ]);
            }
        }

        // ----------------------------------------------------------
        // 14. COMPETITION ANNOUNCEMENTS
        // ----------------------------------------------------------
        foreach ($competitions as $comp) {
            if (rand(0, 1)) {
                CompetitionAnnouncement::create([
                    'competition_id' => $comp->id,
                    'created_by' => $admin->id,
                    'title' => 'Announcement for ' . $comp->title,
                    'message' => 'Important update for participants.',
                ]);
            }
        }

        // ----------------------------------------------------------
        // 15. EXAM ATTEMPTS (FIXED: use different variable name)
        // ----------------------------------------------------------
        $bankedCompetitions = Competition::where('has_question_bank', true)->get();
        foreach ($bankedCompetitions as $comp) {
            $compParticipants = $comp->participants()->pluck('users.id');
            foreach ($compParticipants as $pid) {
                if (rand(0, 1)) {
                    $bank = $comp->questionBank;
                    if ($bank) {
                        $attempt = ExamAttempt::create([
                            'competition_id' => $comp->id,
                            'participant_id' => $pid,
                            'started_at' => $comp->submission_deadline->copy()->subHours(rand(1, 5)),
                            'submitted_at' => rand(0, 1) ? now() : null,
                            'score' => rand(0, 100),
                            'max_score' => $bank->number_of_questions * 5,
                            'status' => ['in_progress', 'submitted', 'expired'][rand(0, 2)],
                        ]);

                        $questions = $bank->questions()->inRandomOrder()->take($bank->number_of_questions)->get();
                        $order = 1;
                        foreach ($questions as $q) {
                            $selected = $q->correct_answer;
                            if (rand(0, 1)) {
                                $selected = ['A', 'B', 'C', 'D'][rand(0, 3)];
                            }
                            ExamAttemptQuestion::create([
                                'exam_attempt_id' => $attempt->id,
                                'question_id' => $q->id,
                                'selected_answer' => $selected,
                                'is_correct' => $selected === $q->correct_answer ? 1 : 0,
                                'points_earned' => $selected === $q->correct_answer ? $q->points : 0,
                                'question_order' => $order++,
                            ]);
                        }
                    }
                }
            }
        }

        // ----------------------------------------------------------
        // 16. USER BADGES (now $participants is still intact)
        // ----------------------------------------------------------
        $badgeIds = Badge::pluck('id');
        foreach ($participants as $p) {
            $assigned = $badgeIds->random(rand(1, 4));
            foreach ($assigned as $bid) {
                UserBadge::create([
                    'user_id' => $p->id,
                    'badge_id' => $bid,
                    'count' => rand(1, 3),
                    'first_earned_at' => now()->subDays(rand(0, 30)),
                    'last_earned_at' => now()->subDays(rand(0, 5)),
                ]);
            }
        }

        $this->command->info('All data seeded successfully.');
    }
}
