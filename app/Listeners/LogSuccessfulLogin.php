<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use App\Models\LoginLog;
use App\Models\User;

class LogSuccessfulLogin
{
    public function handle(Login $event): void
    {
        /** @var User $user */
        $user = $event->user;

        // Create login log entry
        LoginLog::create([
            'user_id' => $user->id,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'location' => $this->getLocation(request()->ip()),
            'status' => 'success',
        ]);

        // Enhanced activity logging with more detailed properties
        activity()
            ->performedOn($user)
            ->causedBy($user)  // This ensures the user is properly associated
            ->withProperties([
                'type' => 'successful_login',
                'user_id' => $user->id,
                'user_email' => $user->email,
                'user_name' => $user->name,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'timestamp' => now()->toIso8601String(),
                'roles' => $user->roles->pluck('name'),
                'browser_info' => $this->getBrowserInfo(request()->userAgent()),
            ])
            ->log('Connexion réussie');  // Changed to French and more descriptive
    }

    private function getLocation(string $ip): ?string
    {
        return null;
    }

    private function getBrowserInfo(?string $userAgent): array
    {
        if (!$userAgent) {
            return ['unknown' => true];
        }

        return [
            'user_agent' => $userAgent,
            'platform' => $this->getPlatform($userAgent),
            'browser' => $this->getBrowser($userAgent),
        ];
    }

    private function getPlatform(string $userAgent): string
    {
        $platforms = [
            'Windows' => '/windows|win32/i',
            'Mac' => '/macintosh|mac os x/i',
            'Linux' => '/linux/i',
            'iOS' => '/iphone|ipad|ipod/i',
            'Android' => '/android/i',
        ];

        foreach ($platforms as $platform => $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return $platform;
            }
        }

        return 'Unknown';
    }

    private function getBrowser(string $userAgent): string
    {
        $browsers = [
            'Chrome' => '/chrome/i',
            'Firefox' => '/firefox/i',
            'Safari' => '/safari/i',
            'Edge' => '/edge/i',
            'Opera' => '/opera|OPR/i',
            'IE' => '/MSIE|Trident/i',
        ];

        foreach ($browsers as $browser => $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return $browser;
            }
        }

        return 'Unknown';
    }
}
