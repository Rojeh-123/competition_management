<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
    protected $fillable = ['name', 'logo_path', 'competition_id'];

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    // Team members are Users with role = participant, not a separate Player model
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_user')->withTimestamps();
    }
}
