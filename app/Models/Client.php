<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Client extends Model
{
    use LogsActivity, SoftDeletes;

    protected $fillable = [
        'company_name',
        'contact_name',
        'email',
        'phone',
        'address',
        'city',
        'postal_code',
        'country',
        'ice',
        'rc',
        'patente',
        'cnss',
        'if_number',
        'tax_regime',
        'is_tva_subject',
        'is_active',
        'notes',
    ];

    protected $casts = [
        'is_tva_subject' => 'boolean',
        'is_active' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    /* Relations */
    public function quotes(): HasMany
    {
        return $this->hasMany(Quote::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /* Scopes */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /* Accessors */
    public function getFullNameAttribute(): string
    {
        return $this->contact_name 
            ? "{$this->company_name} ({$this->contact_name})"
            : $this->company_name;
    }

    public function getFormattedAddressAttribute(): string
    {
        $parts = array_filter([
            $this->address,
            $this->postal_code ? "{$this->postal_code} {$this->city}" : $this->city,
            $this->country !== 'Maroc' ? $this->country : null,
        ]);

        return implode("\n", $parts);
    }

    /* Activity Log */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('client')
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Client has been {$eventName}");
    }

    /* Helpers */
    public function toSnapshot(): array
    {
        return [
            'company_name' => $this->company_name,
            'contact_name' => $this->contact_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'country' => $this->country,
            'ice' => $this->ice,
            'rc' => $this->rc,
            'patente' => $this->patente,
            'cnss' => $this->cnss,
            'if_number' => $this->if_number,
            'tax_regime' => $this->tax_regime,
            'is_tva_subject' => $this->is_tva_subject,
        ];
    }
}