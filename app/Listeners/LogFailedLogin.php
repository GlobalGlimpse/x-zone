<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Failed;
use App\Models\LoginLog;
use App\Models\User;

class LogFailedLogin
{
    public function handle(Failed $event): void
    {
        if ($event->user instanceof User) {
            /** @var User $user */
            $user = $event->user;

            LoginLog::create([
                'user_id' => $user->id,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'location' => $this->getLocation(request()->ip()),
                'status' => 'failed',
            ]);

            activity()
                ->performedOn($user)
                ->withProperties([
                    'ip' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ])
                ->log('failed_login_attempt');
        }
    }

    private function getLocation(string $ip): ?string
    {
        return null;
    }
}
