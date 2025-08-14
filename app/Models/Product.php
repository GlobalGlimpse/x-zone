<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{
    HasOne, HasMany, BelongsToMany, BelongsTo
};
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Collection;

class Product extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'id', 'brand_id', 'name', 'model', 'sku', 'description',
        'price', 'stock_quantity', 'currency_code',
        'tax_rate_id', 'category_id', 'image_main', 'is_active',
        'has_variants', 'meta_title', 'meta_description', 'meta_keywords'
    ];

    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'price' => 'decimal:2',
        'stock_quantity' => 'integer',
        'is_active' => 'boolean',
        'has_variants' => 'boolean',
    ];

    /* ------------------------------------------------------------------ */
    /* Relations de base                                                  */
    /* ------------------------------------------------------------------ */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function taxRate(): BelongsTo
    {
        return $this->belongsTo(TaxRate::class);
    }

    public function currency(): BelongsTo
    {
        return $this->belongsTo(Currency::class, 'currency_code', 'code');
    }

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function prices(): HasMany
    {
        return $this->hasMany(PriceHistory::class);
    }

    /* ------------------------------------------------------------------ */
    /* Relations pour les attributs dynamiques                           */
    /* ------------------------------------------------------------------ */
    public function attributeValues(): HasMany
    {
        return $this->hasMany(ProductAttributeValue::class, 'product_id');
    }

    public function getCategoryAttributes(): Collection
    {
        if (!$this->category) {
            return collect();
        }

        // Récupère les attributs de la catégorie et de ses parents
        $attributes = collect();
        $category = $this->category;

        while ($category) {
            $attributes = $attributes->merge($category->attributes);
            $category = $category->parent;
        }

        return $attributes->unique('id')->sortBy('sort_order');
    }

    /* ------------------------------------------------------------------ */
    /* Relations pour les variantes                                       */
    /* ------------------------------------------------------------------ */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class, 'parent_product_id');
    }

    public function activeVariants(): HasMany
    {
        return $this->variants()->where('is_active', true);
    }

    /* ------------------------------------------------------------------ */
    /* Compatibilités (conservées)                                       */
    /* ------------------------------------------------------------------ */
    public function compatibilities(): HasMany
    {
        return $this->hasMany(ProductCompatibility::class);
    }

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
    /* Méthodes pour les attributs                                        */
    /* ------------------------------------------------------------------ */
    public function getAttributeValue(string $attributeSlug)
    {
        $attributeValue = $this->attributeValues()
            ->whereHas('attribute', fn($q) => $q->where('slug', $attributeSlug))
            ->first();

        return $attributeValue ? $attributeValue->getCastedValue() : null;
    }

    public function setAttributeValue(string $attributeSlug, $value): void
    {
        $attribute = $this->getCategoryAttributes()
            ->where('slug', $attributeSlug)
            ->first();

        if (!$attribute) {
            return;
        }

        // Convertir la valeur selon le type
        $formattedValue = match ($attribute->type) {
            'json', 'multiselect' => is_array($value) ? json_encode($value) : $value,
            'boolean' => $value ? '1' : '0',
            'date' => $value instanceof \Carbon\Carbon ? $value->toDateString() : $value,
            default => (string) $value,
        };

        $this->attributeValues()->updateOrCreate(
            ['category_attribute_id' => $attribute->id],
            ['value' => $formattedValue]
        );
    }

    public function getFormattedAttributes(): Collection
    {
        return $this->attributeValues()
            ->with('attribute')
            ->get()
            ->map(function ($attributeValue) {
                return [
                    'name' => $attributeValue->attribute->name,
                    'slug' => $attributeValue->attribute->slug,
                    'value' => $attributeValue->formatted_value,
                    'type' => $attributeValue->attribute->type,
                    'unit' => $attributeValue->attribute->unit,
                    'show_in_listing' => $attributeValue->attribute->show_in_listing,
                ];
            });
    }

    /* ------------------------------------------------------------------ */
    /* Scopes                                                             */
    /* ------------------------------------------------------------------ */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeWithAttributeValue($query, string $attributeSlug, $value)
    {
        return $query->whereHas('attributeValues', function ($q) use ($attributeSlug, $value) {
            $q->whereHas('attribute', fn($attr) => $attr->where('slug', $attributeSlug))
              ->where('value', 'like', "%{$value}%");
        });
    }

    public function scopeInCategory($query, $categoryId)
    {
        if (is_array($categoryId)) {
            return $query->whereIn('category_id', $categoryId);
        }
        
        return $query->where('category_id', $categoryId);
    }

    /* ------------------------------------------------------------------ */
    /* Méthodes pour l'e-commerce                                         */
    /* ------------------------------------------------------------------ */
    public function getEffectivePrice(): float
    {
        // Si le produit a des variantes, retourner le prix minimum
        if ($this->has_variants && $this->variants()->exists()) {
            return $this->variants()
                ->where('is_active', true)
                ->min('price') ?? $this->price;
        }

        return $this->price;
    }

    public function getEffectiveStock(): int
    {
        // Si le produit a des variantes, retourner le stock total
        if ($this->has_variants && $this->variants()->exists()) {
            return $this->variants()
                ->where('is_active', true)
                ->sum('stock_quantity');
        }

        return $this->stock_quantity;
    }

    public function isInStock(): bool
    {
        return $this->getEffectiveStock() > 0;
    }

    /* ------------------------------------------------------------------ */
    /* Activity Log                                                       */
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
            'brand_name' => $this->brand?->name,
            'category_name' => $this->category?->name,
        ]);
    }
}