<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Provider extends Model
{
    use LogsActivity, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'address',
        'contact_person',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'deleted_at' => 'datetime',
    ];

    /* Relations */
    public function stockMovements(): HasMany
    {
        return $this->hasMany(StockMovement::class);
    }

    /* Scopes */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /* Accessors */
    public function getFullContactAttribute(): string
    {
        $contact = $this->name;
        if ($this->contact_person) {
            $contact .= " ({$this->contact_person})";
        }
        return $contact;
    }

    /* Activity Log */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('provider')
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Provider has been {$eventName}");
    }
}
