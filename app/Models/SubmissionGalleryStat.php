<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionGalleryStat extends Model
{
    protected $table = 'submission_gallery_stats';

    protected $fillable = [
        'submission_id',
        'impressions',
        'likes',
        'dislikes',
        'last_shown_at',
    ];

    protected $casts = [
        'impressions' => 'integer',
        'likes' => 'integer',
        'dislikes' => 'integer',
        'last_shown_at' => 'datetime',
    ];

    /**
     * The submission this gallery statistic belongs to.
     */
    public function submission(): BelongsTo
    {
        return $this->belongsTo(
            Submission::class,
            'submission_id'
        );
    }
}
