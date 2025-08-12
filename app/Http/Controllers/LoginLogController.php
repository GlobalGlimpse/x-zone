<?php

namespace App\Http\Controllers;

use App\Models\LoginLog;
use Illuminate\Http\Request;
use Inertia\Response;
use Inertia\Inertia;

class LoginLogController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->input('per_page', 10);
        $filters = $request->only(['user', 'status', 'search', 'start_date', 'end_date']);

        $query = LoginLog::with('user')->orderBy('created_at', 'desc');

        // Filtre par utilisateur (nom ou email)
        if (!empty($filters['user'])) {
            $query->whereHas('user', function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['user'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['user'] . '%');
            });
        }

        // Filtre par statut
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filtre global (ip, user agent, location, created_at)
        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('ip_address', 'like', "%{$search}%")
                  ->orWhere('user_agent', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhereRaw("DATE_FORMAT(created_at, '%d/%m/%Y %H:%i') LIKE ?", ["%{$search}%"]);
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

        return Inertia::render('login-logs/Index', [
            'logs' => $query->paginate($perPage)->through(function ($log) {
                return [
                    'id' => $log->id,
                    'user' => $log->user ? [
                        'name' => $log->user->name,
                        'email' => $log->user->email
                    ] : null,
                    'ip_address' => $log->ip_address,
                    'user_agent' => $log->user_agent,
                    'location' => $log->location,
                    'status' => $log->status,
                    'created_at' => $log->created_at->format('Y-m-d H:i:s')
                ];
            }),
            'filters' => $filters,
        ]);
    }
}
