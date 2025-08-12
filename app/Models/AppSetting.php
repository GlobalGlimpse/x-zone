<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class AppSetting extends Model
{
    protected $fillable = [
        'app_name', 'app_slogan',
        'logo_path', 'logo_dark_path', 'favicon_path',
        'primary_color', 'secondary_color',
        'contact_email', 'contact_phone', 'contact_address',
        'cgu_url', 'privacy_url', 'copyright',
        'social_links', 'meta_keywords', 'meta_description',
    ];

    protected $casts = [
        'social_links' => 'array',
    ];

    protected $appends = [
        'logo_url', 'logo_dark_url', 'favicon_url',
    ];

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo_path ? Storage::url($this->logo_path) : null;
    }

    public function getLogoDarkUrlAttribute(): ?string
    {
        return $this->logo_dark_path ? Storage::url($this->logo_dark_path) : null;
    }

    public function getFaviconUrlAttribute(): ?string
    {
        return $this->favicon_path ? Storage::url($this->favicon_path) : null;
    }
}
