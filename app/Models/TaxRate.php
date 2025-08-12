<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class TaxRate extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = ['name', 'rate'];

    /* Relations */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /* Activity log configuration */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('tax_rate')
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $eventName) => "Tax rate has been {$eventName}");
    }
}
