<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExamAttemptQuestion extends Model
{
    protected $fillable = [
        'exam_attempt_id',
        'question_id',
        'selected_answer',
        'is_correct',
        'points_earned',
        'question_order',
    ];

    protected $casts = [
        'is_correct' => 'boolean',
        'points_earned' => 'decimal:2',
        'question_order' => 'integer',
    ];

    public function attempt(): BelongsTo
    {
        return $this->belongsTo(
            ExamAttempt::class,
            'exam_attempt_id'
        );
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
