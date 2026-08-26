<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use App\Models\SubmissionVote;

class Submission extends Model
{
    use HasFactory;

    protected $fillable = [
        'competition_id',
        'participant_id',
        'team_id',
        'category_id',
        'title',
        'description',
        'status',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
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

    public function participant(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function files(): HasMany
    {
        return $this->hasMany(SubmissionFile::class);
    }

    public function versions(): HasMany
    {
        return $this->hasMany(SubmissionVersion::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(Score::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function publicComments(): HasMany
    {
        return $this->hasMany(PublicComment::class);
    }

    public function winner(): HasOne
    {
        return $this->hasOne(CompetitionWinner::class);
    }

    public function voters(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'submission_votes'
        )
            ->using(SubmissionVote::class)
            ->withPivot('created_at');
    }

    public function averageScore(): float
    {
        return (float) $this->scores()->avg('score');
    }

    public function totalScore(): float
    {
        return (float) $this->scores()->sum('score');
    }

    public function latestVersion(): HasOne
    {
        return $this->hasOne(SubmissionVersion::class)->latestOfMany();
    }

    public function galleryStats(): HasOne
    {
        return $this->hasOne(SubmissionGalleryStat::class, 'submission_id');
    }

    public function submissionVotes(): HasMany
    {
        return $this->hasMany(
            SubmissionVote::class,
            'submission_id'
        );
    }
}
