<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompetitionParticipant extends Pivot
{
    protected $table = 'competition_participants';

    public const CREATED_AT = 'joined_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'competition_id',
        'participant_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_id');
    }
}