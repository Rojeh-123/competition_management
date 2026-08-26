<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JudgeAssignment extends Pivot
{
    protected $table = 'judge_assignments';

    public const CREATED_AT = 'assigned_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'competition_id',
        'judge_id',
    ];

    protected function casts(): array
    {
        return [
            'assigned_at' => 'datetime',
        ];
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function judge(): BelongsTo
    {
        return $this->belongsTo(User::class, 'judge_id');
    }
}