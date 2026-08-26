<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserBadge extends Model
{
    protected $table = 'user_badges';

    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'badge_id',
        'count',
        'first_earned_at',
        'last_earned_at',
    ];

    protected $casts = [
        'count'           => 'integer',
        'first_earned_at' => 'datetime',
        'last_earned_at'  => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function badge(): BelongsTo
    {
        return $this->belongsTo(Badge::class);
    }
}
