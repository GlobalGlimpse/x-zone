<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Encoders\PngEncoder;

class AppSettingController extends Controller
{
    public function edit(): Response
    {
        $settings = AppSetting::first();

        if (!$settings) {
            $settings = AppSetting::create(['app_name' => 'X-ZPanel']);
        }

        return Inertia::render('settings/app', [
            'settings' => array_merge(
                $settings->toArray(),
                [
                    'logo_url'       => $settings->logo_url,
                    'logo_dark_url'  => $settings->logo_dark_url,
                    'favicon_url'    => $settings->favicon_url,
                ]
            ),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'app_name'         => 'required|string|max:100',
            'app_slogan'       => 'nullable|string|max:255',
            'primary_color'    => 'nullable|string|max:32',
            'secondary_color'  => 'nullable|string|max:32',
            'contact_email'    => 'nullable|email|max:100',
            'contact_phone'    => 'nullable|string|max:32',
            'contact_address'  => 'nullable|string|max:255',
            'cgu_url'          => 'nullable|url|max:255',
            'privacy_url'      => 'nullable|url|max:255',
            'copyright'        => 'nullable|string|max:255',
            'meta_keywords'    => 'nullable|string|max:1000',
            'meta_description' => 'nullable|string|max:1000',
            'logo'             => 'nullable|image|mimes:jpeg,png,svg,webp|max:2048',
            'logo_dark'        => 'nullable|image|mimes:jpeg,png,svg,webp|max:2048',
            'favicon'          => 'nullable|image|mimes:png,ico|max:512',
            'social_links'     => 'nullable|array',
            'social_links.*'   => 'nullable|url|max:255',
        ]);

        $settings = AppSetting::firstOrFail();

        $manager = new ImageManager(new Driver());

        if ($request->hasFile('logo')) {
            $logoPath = $request->file('logo')->store('logos', 'public');
            $data['logo_path'] = $logoPath;

            if (!$request->hasFile('favicon')) {
                $img = $manager->read($request->file('logo')->getPathname());
                $img->resize(48, 48);
                $encodedImage = $img->encode(new PngEncoder());
                $faviconPath = 'favicons/' . uniqid() . '.png';
                Storage::disk('public')->put($faviconPath, $encodedImage);
                $data['favicon_path'] = $faviconPath;
            }
        }

        if ($request->hasFile('logo_dark')) {
            $data['logo_dark_path'] = $request->file('logo_dark')->store('logos', 'public');
        }

        if ($request->hasFile('favicon')) {
            $file = $request->file('favicon');
            $filename = 'favicon.png';
            $path = 'favicons/' . $filename;
            Storage::disk('public')->putFileAs('favicons', $file, $filename);
            copy(storage_path('app/public/' . $path), public_path($filename));
            $data['favicon_path'] = $path;
        }

        if ($request->filled('social_links')) {
            $data['social_links'] = json_encode($request->input('social_links'));
        }

        $settings->update($data);

        return redirect()->route('settings.app.edit')->with('success', 'Paramètres enregistrés !');
    }
}
