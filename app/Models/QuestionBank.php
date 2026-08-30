<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionBank extends Model
{
    protected $fillable = [
        'competition_id',
        'number_of_questions',
        'duration_minutes',
    ];

    protected $casts = [
        'number_of_questions' => 'integer',
        'duration_minutes' => 'integer',
    ];

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class)
            ->orderBy('sort_order');
    }
}
