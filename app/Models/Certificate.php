<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Certificate extends Model
{
    public const UPDATED_AT = null; // table has no updated_at column

    protected $fillable = [
        'participant_id',
        'competition_id',
        'winner_id',
        'certificate_code',
        'certificate_url',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Certificate $certificate) {
            $certificate->certificate_code ??= (string) Str::uuid();
            $certificate->issued_at ??= now();
        });
    }

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

    public function isWinnerCertificate(): bool
    {
        return $this->winner_id !== null;
    }
}
