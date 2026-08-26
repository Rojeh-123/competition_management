<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Carbon\Carbon;

class Competition extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image',
        'category_id',
        'description',
        'rules',

        'start_date',
        'registration_deadline',
        'submission_deadline',
        'judging_start_date',
        'judging_end_date',
        'end_date',
        'published_at',
        'winner_announced_at',

        'max_file_size_mb',
        'allowed_file_types',
        'number_of_winners',
        'prize_description',

        'visibility',
        'status',
        'is_featured',
        'team_allowed',
        'certificate_enabled',
        'requires_approval',

        'min_age',
        'max_age',

        'contact_email',
        'contact_phone',
        'created_by',
    ];

    protected $casts = [
        'start_date' => 'datetime',
        'registration_deadline' => 'datetime',
        'submission_deadline' => 'datetime',
        'judging_start_date' => 'datetime',
        'judging_end_date' => 'datetime',
        'end_date' => 'datetime',
        'published_at' => 'datetime',
        'winner_announced_at' => 'datetime',

        'is_featured' => 'boolean',
        'team_allowed' => 'boolean',
        'certificate_enabled' => 'boolean',
        'requires_approval' => 'boolean',

        'visibility' => 'string',
        'status' => 'string',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function participants(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'competition_participants',
            'competition_id',
            'participant_id'
        )
        ->using(CompetitionParticipant::class)
        ->withPivot(['status', 'joined_at']);
    }

    public function judges(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'judge_assignments',
            'competition_id',
            'judge_id'
        )
        ->using(JudgeAssignment::class)
        ->withPivot('assigned_at');
    }

    public function favorites(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'favorite_competitions'
        )
        ->using(FavoriteCompetition::class)
        ->withPivot('created_at');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function sponsors(): BelongsToMany
    {
        return $this->belongsToMany(
            Sponsor::class,
            'competition_sponsors'
        )->withTimestamps();
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(
            Tag::class,
            'competition_tags'
        )->withTimestamps();
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(CompetitionAnnouncement::class);
    }

    public function scoreCriteria(): HasMany
    {
        return $this->hasMany(CompetitionScoreCriterion::class);
    }

    public function winners(): HasMany
    {
        return $this->hasMany(CompetitionWinner::class);
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'competition_id');
    }

    public function latestAnnouncement(): HasOne
    {
        return $this->hasOne(CompetitionAnnouncement::class)->latestOfMany();
    }

    public function teams(): HasMany
    {
        return $this->hasMany(Team::class);
    }

    public function computeStatus(): string
    {
        $today = Carbon::today();

        if ($today->lt(Carbon::parse($this->start_date))) {
            return 'upcoming';
        }

        if ($today->lte(Carbon::parse($this->registration_deadline))) {
            return 'open';
        }

        if ($today->lte(Carbon::parse($this->submission_deadline))) {
            return 'submission_closed';
        }

        if (
            ! empty($this->judging_start_date) &&
            ! empty($this->judging_end_date) &&
            $today->between(
                Carbon::parse($this->judging_start_date),
                Carbon::parse($this->judging_end_date)
            )
        ) {
            return 'judging';
        }

        if (
            ! empty($this->winner_announced_at) &&
            $today->gte(Carbon::parse($this->winner_announced_at))
        ) {
            return 'results_published';
        }

        return 'archived';
    }
}