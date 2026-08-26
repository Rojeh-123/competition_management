<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $table = 'notifications';
    use HasFactory;

    public const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'priority',
        'is_read',
        'image',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'created_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relationships
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function markAsRead(): bool
    {
        return $this->update([
            'is_read' => true,
        ]);
    }

    public function markAsUnread(): bool
    {
        return $this->update([
            'is_read' => false,
        ]);
    }
}
