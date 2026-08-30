<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    protected $fillable = [
        'question_bank_id',
        'question_text',
        'choices',
        'correct_answer',
        'points',
        'sort_order',
    ];

    protected $casts = [
        'choices' => 'array',
        'points' => 'decimal:2',
        'sort_order' => 'integer',
    ];

    public function questionBank(): BelongsTo
    {
        return $this->belongsTo(QuestionBank::class);
    }

    public function attemptQuestions(): HasMany
    {
        return $this->hasMany(ExamAttemptQuestion::class);
    }
}
