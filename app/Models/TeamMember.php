<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeamMember extends Pivot
{
    protected $table = 'team_members';

    public const CREATED_AT = 'joined_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'team_id',
        'user_id',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'datetime',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}