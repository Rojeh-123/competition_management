<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class CompetitionWinner extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'competition_id',
        'submission_id',
        'participant_id',
        'rank_position',
        'final_score',
    ];

    protected function casts(): array
    {
        return [
            'rank_position' => 'integer',
            'final_score' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function certificate(): HasOne
    {
        return $this->hasOne(Certificate::class, 'winner_id');
    }
}