<?php

namespace App\Http\Controllers;

use App\Exports\AuditLogsExport;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Inertia\Inertia;
use Carbon\Carbon;
use Maatwebsite\Excel\Facades\Excel;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);
        $filters = $request->only(['user', 'action', 'subject_type', 'search', 'start_date', 'end_date']);

        $query = Activity::query()->with('causer')->orderBy('created_at', 'desc');

        // Filtre par utilisateur (nom ou email)
        if (!empty($filters['user'])) {
            $userInput = trim(strtolower($filters['user']));
            if ($userInput === '__system__') {
                $query->whereNull('causer_id');
            } else {
                $query->whereHas('causer', function ($q) use ($filters) {
                    $q->where('name', 'like', '%' . $filters['user'] . '%')
                      ->orWhere('email', 'like', '%' . $filters['user'] . '%');
                });
            }
        }

        // Filtre par action/description
        if (!empty($filters['action'])) {
            $query->where('description', 'like', '%' . $filters['action'] . '%');
        }

        // Filtre par type d'objet
        if (!empty($filters['subject_type'])) {
            $query->where('subject_type', $filters['subject_type']);
        }

        // Filtre global (description, subject_type, subject_id, causer)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('subject_type', 'like', "%{$search}%")
                  ->orWhere('subject_id', 'like', "%{$search}%")
                  ->orWhereRaw("DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') LIKE ?", ["%{$search}%"])
                  ->orWhereHas('causer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Filtre par date de début
        if (!empty($filters['start_date'])) {
            $query->whereDate('created_at', '>=', $filters['start_date']);
        }

        // Filtre par date de fin
        if (!empty($filters['end_date'])) {
            $query->whereDate('created_at', '<=', $filters['end_date']);
        }

        return Inertia::render('audit-logs/Index', [
            'logs' => $query->paginate($perPage)->through(function ($log) {
                return [
                    'id' => $log->id,
                    'description' => $log->description,
                    'subject_type' => $log->subject_type,
                    'subject_id' => $log->subject_id,
                    'causer' => $log->causer ? [
                        'name' => $log->causer->name,
                        'email' => $log->causer->email
                    ] : null,
                    'properties' => $log->properties,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s')
                ];
            }),
            'filters' => $filters,
        ]);
    }

    public function export(Request $request)
    {
        $filters = $request->only(['user', 'action', 'subject_type', 'search', 'start_date', 'end_date']);
        return Excel::download(new AuditLogsExport($filters), 'audit_logs.xlsx');
    }
}
