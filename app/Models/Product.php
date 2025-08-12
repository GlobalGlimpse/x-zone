<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{
    HasOne, HasMany, BelongsToMany
};
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;

class Product extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'id', 'brand_id', 'name', 'model', 'sku', 'description',
        'price', 'stock_quantity', 'currency_code',
        'tax_rate_id', 'category_id', 'image_main', 'is_active',
    ];

    public $incrementing = false;   // UUIDv7
    protected $keyType    = 'string';

    /* ------------------------------------------------------------------ */
    /* Relations génériques                                               */
    /* ------------------------------------------------------------------ */
    public function category()         { return $this->belongsTo(Category::class); }
    public function taxRate()          { return $this->belongsTo(TaxRate::class); }
    public function currency()         { return $this->belongsTo(Currency::class, 'currency_code', 'code'); }
    public function brand()            { return $this->belongsTo(Brand::class); }
    public function images(): HasMany  { return $this->hasMany(ProductImage::class); }
    public function prices(): HasMany  { return $this->hasMany(PriceHistory::class); }
    public function compatibilities(): HasMany { return $this->hasMany(ProductCompatibility::class); }

    /* ------------------------------------------------------------------ */
    /* Compatibilités via pivot (soft-delete inclus)                       */
    /* ------------------------------------------------------------------ */
    public function compatibleWith(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_compatibilities',
            'product_id',
            'compatible_with_id'
        )
        ->withPivot(['direction', 'note', 'deleted_at'])
        ->withTimestamps()
        ->wherePivotNull('deleted_at');
    }

    public function isCompatibleWith(): BelongsToMany
    {
        return $this->belongsToMany(
            Product::class,
            'product_compatibilities',
            'compatible_with_id',
            'product_id'
        )
        ->withPivot(['direction', 'note', 'deleted_at'])
        ->withTimestamps()
        ->wherePivotNull('deleted_at');
    }

    /* ------------------------------------------------------------------ */
    /* Relations spécialisées (camelCase “officiel”)                      */
    /* ------------------------------------------------------------------ */
    public function ram():           HasOne { return $this->hasOne(Ram::class); }
    public function processor():     HasOne { return $this->hasOne(Processor::class); }
    public function hardDrive():     HasOne { return $this->hasOne(HardDrive::class); }
    public function powerSupply():   HasOne { return $this->hasOne(PowerSupply::class); }
    public function motherboard():   HasOne { return $this->hasOne(Motherboard::class); }
    public function networkCard():   HasOne { return $this->hasOne(NetworkCard::class); }
    public function graphicCard():   HasOne { return $this->hasOne(GraphicCard::class); }
    public function license():       HasOne { return $this->hasOne(License::class); }
    public function software():      HasOne { return $this->hasOne(Software::class); }
    public function accessory():     HasOne { return $this->hasOne(Accessory::class); }
    public function laptop():        HasOne { return $this->hasOne(Laptop::class); }
    public function desktop():       HasOne { return $this->hasOne(Desktop::class); }
    public function server():        HasOne { return $this->hasOne(Server::class); }

    /* ------------------------------------------------------------------ */
    /* Alias slug-friendly (pour config.catalog)                           */
    /* ------------------------------------------------------------------ */
    public function rams()           { return $this->ram(); }
    public function processors()     { return $this->processor(); }
    public function hard_drives()    { return $this->hardDrive(); }
    public function power_supplies() { return $this->powerSupply(); }
    public function motherboards()   { return $this->motherboard(); }
    public function network_cards()  { return $this->networkCard(); }
    public function graphic_cards()  { return $this->graphicCard(); }
    public function licenses()       { return $this->license(); }
    public function softwares()      { return $this->software(); }
    public function accessories()    { return $this->accessory(); }
    public function laptops()        { return $this->laptop(); }
    public function desktops()       { return $this->desktop(); }
    public function servers()        { return $this->server(); }

    /* ------------------------------------------------------------------ */
    /* Logs d’activité (Spatie)                                           */
    /* ------------------------------------------------------------------ */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('product')
            ->logAll()
            ->logOnlyDirty()
            ->logExcept(['image_main'])
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(fn(string $e) => "Product has been {$e}");
    }

    public function tapActivity(Activity $activity, string $event): void
    {
        $activity->properties = $activity->properties->merge([
            'brand_name'    => $this->brand?->name,
            'category_name' => $this->category?->name,
        ]);
    }
}
