<?php

namespace App\Helpers;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class AuditLogger
{
    public static function log(
        string $action,
        string $table,
        int|string|null $recordId = null,
        ?string $details = null,
        ?Request $request = null
    ): void {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => strtoupper($action),
            'table_name' => $table,
            'record_id' => $recordId,
            'details' => $details,
            'ip_address' => $request?->ip() ?? request()->ip(),
        ]);
    }
}