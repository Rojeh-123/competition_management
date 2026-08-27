<?php

namespace App\Console\Commands;

use App\Models\Competition;
use App\Models\CompetitionWinner;
use App\Models\User;
use App\Support\AwardsBadges;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RefreshCompetitionStatuses extends Command
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
            $submissions = $competition->submissions()->with('scores')->get();

            $rankedSubmissions = $submissions
                ->map(function ($submission) {
                    $finalScore = $submission->scores
                        ->where('status', 'Locked')
                        ->sum('score');

                    return [
                        'submission' => $submission,
                        'final_score' => $finalScore,
                    ];
                })
                ->sortByDesc('final_score')
                ->values();

            $numberOfWinners = (int) $competition->number_of_winners;
            $winners = $rankedSubmissions->take($numberOfWinners);

            $maxPossibleScore = $competition->scoreCriteria()->sum('max_score');

            foreach ($winners as $index => $winner) {
                $submission = $winner['submission'];
                $rankPosition = $index + 1;

                CompetitionWinner::updateOrCreate(
                    [
                        'competition_id' => $competition->id,
                        'submission_id' => $submission->id,
                    ],
                    [
                        'participant_id' => $submission->participant_id,
                        'rank_position' => $rankPosition,
                        'final_score' => $winner['final_score'],
                    ]
                );

                $user = User::findOrFail($submission->participant_id);

                if ($rankPosition === 1) {
                    $this->awardBadge($user, 'champion');
                }

                if ($rankPosition === 2 || $rankPosition === 3) {
                    $this->awardBadge($user, 'podium-finisher');
                }

                if ($maxPossibleScore > 0 && $winner['final_score'] == $maxPossibleScore) {
                    $this->awardBadge($user, 'perfect-score');
                }
            }

            $competition->update(['status' => 'results_published']);
        });
    }
}
