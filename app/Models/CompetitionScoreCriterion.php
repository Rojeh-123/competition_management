<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CompetitionScoreCriterion extends Model
{
    use HasFactory;

    public const UPDATED_AT = null;

    protected $table = 'competition_score_criteria';

    protected $fillable = [
        'competition_id',
        'name',
        'max_score',
    ];

    protected function casts(): array
    {
        return [
            'competition_id' => 'integer',
            'max_score' => 'integer',
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

    public function scores(): HasMany
    {
        return $this->hasMany(Score::class, 'criterion_id');
    }
}