<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\Role as CustomRole;
use App\Models\Permission as CustomPermission;
use Inertia\Inertia;
use App\Models\AppSetting;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(Role::class, CustomRole::class);
        $this->app->bind(Permission::class, CustomPermission::class);
    }

    public function boot(): void
    {
        Inertia::share('settings', function () {
            $s = AppSetting::first();

            return [
                'app_name'       => $s?->app_name    ?? config('app.name', 'Mon Application'),
                'logo_path'      => $s && $s->logo_path
                    ? asset('storage/'.$s->logo_path)
                    : asset('storage/settings/logo.png'),
                'logo_dark_path' => $s && $s->logo_dark_path
                    ? asset('storage/'.$s->logo_dark_path)
                    : null,
                'favicon_url'     => $s?->favicon_path
                                      ? asset('storage/'.$s->favicon_path)
                                      : asset('/favicon.png'),
            ];
        });
    }
}
