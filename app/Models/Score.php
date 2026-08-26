<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Score extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'submission_id',
        'judge_id',
        'criterion_id',
        'score',
        'comment',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judge_id');
    }

    public function criterion(): BelongsTo
    {
        return $this->belongsTo(CompetitionScoreCriterion::class, 'criterion_id');
    }
}