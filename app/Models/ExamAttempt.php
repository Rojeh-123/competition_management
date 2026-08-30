<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

class ExamAttempt extends Model
{
    protected $fillable = [
        'competition_id',
        'participant_id',
        'started_at',
        'submitted_at',
        'score',
        'max_score',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'submitted_at' => 'datetime',
        'score' => 'decimal:2',
        'max_score' => 'decimal:2',
    ];

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function attemptQuestions(): HasMany
    {
        return $this->hasMany(ExamAttemptQuestion::class)
            ->orderBy('question_order');
    }

    /**
     * Grade this attempt and permanently mark it as finished.
     */
    public function finalize(string $status): void
    {
        DB::transaction(function () use ($status) {

            $this->load(['attemptQuestions.question']);

            $score = 0;
            $maxScore = 0;

            foreach ($this->attemptQuestions as $attemptQuestion) {
                $question = $attemptQuestion->question;

                $maxScore += (float) $question->points;

                $isCorrect = $attemptQuestion->selected_answer !== null
                    && $attemptQuestion->selected_answer === $question->correct_answer;

                $pointsEarned = $isCorrect ? (float) $question->points : 0;

                if ($isCorrect) {
                    $score += $pointsEarned;
                }

                $attemptQuestion->update([
                    'is_correct' => $isCorrect,
                    'points_earned' => $pointsEarned,
                ]);
            }

            $this->update([
                'status' => $status,
                'submitted_at' => now(),
                'score' => $score,
                'max_score' => $maxScore,
            ]);
        });
    }

    public function hasExpired(int $durationMinutes): bool
    {
        return now()->greaterThanOrEqualTo(
            $this->started_at->copy()->addMinutes($durationMinutes)
        );
    }
}
