<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'username',
        'full_name',
        'avatar_url',
        'country',
        'age',
        'bio',
        'role',
        'account_status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'age' => 'integer',
        ];
    }

    public function createdCompetitions(): HasMany
    {
        return $this->hasMany(Competition::class, 'created_by');
    }

    public function participatingCompetitions(): BelongsToMany
    {
        return $this->belongsToMany(
            Competition::class,
            'competition_participants',
            'participant_id',
            'competition_id'
        )
        ->using(CompetitionParticipant::class)
        ->withPivot(['status', 'joined_at']);
    }

    public function judgingCompetitions(): BelongsToMany
    {
        return $this->belongsToMany(
            Competition::class,
            'judge_assignments',
            'judge_id',
            'competition_id'
        )
        ->using(JudgeAssignment::class)
        ->withPivot('assigned_at');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'participant_id');
    }

    public function scores(): HasMany
    {
        return $this->hasMany(Score::class, 'judge_id');
    }

    public function certificates(): HasMany
    {
        return $this->hasMany(Certificate::class, 'participant_id');
    }

    public function winners(): HasMany
    {
        return $this->hasMany(CompetitionWinner::class, 'participant_id');
    }

    public function announcements(): HasMany
    {
        return $this->hasMany(CompetitionAnnouncement::class, 'created_by');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class, 'generated_by');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function captainedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'captain_id');
    }

    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_user')->withTimestamps();
    }

    public function badges(): BelongsToMany
    {
        return $this->belongsToMany(Badge::class, 'user_badges')
            ->withPivot(['count', 'first_earned_at', 'last_earned_at']);
    }
}