<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Certificate extends Model
{
    use HasFactory;

    public const CREATED_AT = 'issued_at';
    public const UPDATED_AT = null;

    protected $fillable = [
        'participant_id',
        'competition_id',
        'winner_id',
        'certificate_code',
        'certificate_url',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function winner(): BelongsTo
    {
        return $this->belongsTo(CompetitionWinner::class, 'winner_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isWinnerCertificate(): bool
    {
        return ! is_null($this->winner_id);
    }

    public function isParticipationCertificate(): bool
    {
        return is_null($this->winner_id);
    }
}