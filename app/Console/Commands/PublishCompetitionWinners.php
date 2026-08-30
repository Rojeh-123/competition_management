<?php

namespace App\Console\Commands;

use App\Models\Competition;
use App\Models\CompetitionWinner;
use App\Models\Notification;
use App\Models\User;
use App\Helpers\AwardsBadges;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PublishCompetitionWinners extends Command
{
    use AwardsBadges;

    protected $signature = 'app:refresh-competition-statuses';

    protected $description = 'Recompute each competition\'s status based on today\'s date, publishing winners when results go live';

    public function handle(): int
    {
        $updated = 0;

        Competition::query()
            ->orderBy('id')
            ->chunkById(100, function ($competitions) use (&$updated) {
                foreach ($competitions as $competition) {
                    $newStatus = $competition->computeStatus();

                    if ($newStatus === $competition->status) {
                        continue;
                    }

                    $this->info(
                        "Competition #{$competition->id}: {$competition->status} -> {$newStatus}"
                    );

                    if ($newStatus === 'results_published') {
                        $this->publishResults($competition);
                    } else {
                        $competition->update(['status' => $newStatus]);
                    }

                    $this->notifyParticipantsOfStatusChange($competition, $newStatus);

                    if (Carbon::today()->gt(Carbon::parse($competition->submission_deadline))) {
                        $this->resetMissedStreaks($competition);
                    }

                    $updated++;
                }
            });

        $this->info($updated > 0
            ? "Updated status for {$updated} competition(s)."
            : 'No competition statuses needed updating.');

        return Command::SUCCESS;
    }

    protected function notifyParticipantsOfStatusChange(Competition $competition, string $newStatus): void
    {
        $participantIds = $competition->participants()
            ->pluck('users.id');

        if ($participantIds->isEmpty()) {
            return;
        }

        [$title, $message] = $this->statusChangeNotificationContent($competition, $newStatus);

        $now = now();

        $rows = $participantIds->map(fn($userId) => [
            'user_id'    => $userId,
            'title'      => $title,
            'message'    => $message,
            'priority'   => 1,
            'source'     => 'status_change',
            'is_read'    => false,
            'image'      => null,
            'created_at' => $now,
        ])->all();

        foreach (array_chunk($rows, 500) as $chunk) {
            Notification::insert($chunk);
        }
    }

    protected function statusChangeNotificationContent(Competition $competition, string $newStatus): array
    {
        return match ($newStatus) {
            'results_published' => [
                'Results Published: ' . $competition->title,
                'Results for "' . $competition->title . '" are now available. Check your rank.',
            ],
            default => [
                'Competition Update: ' . $competition->title,
                '"' . $competition->title . '" is now ' . str($newStatus)->replace('_', ' ') . '.',
            ],
        };
    }

    protected function resetMissedStreaks(Competition $competition): void
    {
        $submittedUserIds = $competition->submissions()
            ->pluck('participant_id');

        $missedUserIds = $competition->participants()
            ->whereNotIn('users.id', $submittedUserIds)
            ->pluck('users.id');

        if ($missedUserIds->isNotEmpty()) {
            User::whereIn('id', $missedUserIds)
                ->where('competition_streak', '>', 0)
                ->update(['competition_streak' => 0]);
        }
    }

    protected function publishResults(Competition $competition): void
    {
        DB::transaction(function () use ($competition) {
            if ($competition->has_question_bank) {
                $questionBank = $competition->questionBank;

                if ($questionBank) {
                    $competition->examAttempts()
                        ->where('status', 'in_progress')
                        ->get()
                        ->each(function ($attempt) use ($questionBank) {
                            if ($attempt->hasExpired($questionBank->duration_minutes)) {
                                $attempt->finalize('expired');
                            }
                        });
                }
            }

            $submissions = $competition->submissions()
                ->with('scores')
                ->get()
                ->keyBy('participant_id');

            $examAttempts = $competition->has_question_bank
                ? $competition->examAttempts()
                ->whereIn('status', ['submitted', 'expired'])
                ->get()
                ->keyBy('participant_id')
                : collect();

            $participantIds = $submissions->keys()
                ->merge($examAttempts->keys())
                ->unique();

            $maxJudgingScore = $competition->scoreCriteria()->sum('max_score');

            $ranked = $participantIds
                ->map(function ($participantId) use ($submissions, $examAttempts) {

                    $submission = $submissions->get($participantId);

                    $judgingScore = $submission
                        ? $submission->scores->where('status', 'Locked')->sum('score')
                        : 0;

                    $examAttempt = $examAttempts->get($participantId);

                    $examScore = $examAttempt ? (float) $examAttempt->score : 0;
                    $examMaxScore = $examAttempt ? (float) $examAttempt->max_score : 0;

                    return [
                        'participant_id' => $participantId,
                        'submission' => $submission,
                        'exam_max_score' => $examMaxScore,
                        'final_score' => $judgingScore + $examScore,
                    ];
                })
                ->sortByDesc('final_score')
                ->values();

            $numberOfWinners = (int) $competition->number_of_winners;
            $winners = $ranked->take($numberOfWinners);

            CompetitionWinner::where('competition_id', $competition->id)->delete();

            foreach ($winners as $index => $winner) {
                $rankPosition = $index + 1;

                CompetitionWinner::create([
                    'competition_id' => $competition->id,
                    'participant_id' => $winner['participant_id'],
                    'submission_id' => $winner['submission']?->id,
                    'rank_position' => $rankPosition,
                    'final_score' => $winner['final_score'],
                ]);

                $user = User::findOrFail($winner['participant_id']);

                if ($rankPosition === 1) {
                    $this->awardBadge($user, 'champion');
                }

                if ($rankPosition === 2 || $rankPosition === 3) {
                    $this->awardBadge($user, 'podium-finisher');
                }

                $maxPossibleScore = $maxJudgingScore + $winner['exam_max_score'];

                if ($maxPossibleScore > 0 && $winner['final_score'] == $maxPossibleScore) {
                    $this->awardBadge($user, 'perfect-score');
                }
            }

            $competition->update(['status' => 'results_published']);
        });
    }
}
