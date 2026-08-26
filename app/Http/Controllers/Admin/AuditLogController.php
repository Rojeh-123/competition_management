<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index()
    {
        $auditLogs = AuditLog::with('user:id,full_name')
            ->latest('created_at')
            ->get([
                'id',
                'user_id',
                'action',
                'table_name',
                'record_id',
                'details',
                'ip_address',
                'created_at',
            ]);

        return Inertia::render('admin/AuditLogsPage', [
            'auditLogs' => $auditLogs,
        ]);
    }
}