<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\{HasMany, BelongsTo};
use Illuminate\Support\Collection;

class Category extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'parent_id', 'level', 'sort_order', 
        'is_active', 'description', 'icon', 'image'
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'level' => 'integer',
        'sort_order' => 'integer',
    ];

    /* ------------------------------------------------------------------ */
    /* Relations hiérarchiques                                            */
    /* ------------------------------------------------------------------ */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order');
    }

    public function allChildren(): HasMany
    {
        return $this->children()->with('allChildren');
    }

    /* ------------------------------------------------------------------ */
    /* Relations avec produits et attributs                               */
    /* ------------------------------------------------------------------ */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class, 'category_id', 'id');
    }

    public function attributes(): HasMany
    {
        return $this->hasMany(CategoryAttribute::class)->orderBy('sort_order');
    }

    /* ------------------------------------------------------------------ */
    /* Scopes                                                             */
    /* ------------------------------------------------------------------ */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    public function scopeLevel($query, int $level)
    {
        return $query->where('level', $level);
    }

    /* ------------------------------------------------------------------ */
    /* Accessors et méthodes utilitaires                                  */
    /* ------------------------------------------------------------------ */
    public function getFullNameAttribute(): string
    {
        $names = collect([$this->name]);
        $parent = $this->parent;
        
        while ($parent) {
            $names->prepend($parent->name);
            $parent = $parent->parent;
        }
        
        return $names->implode(' > ');
    }

    public function getBreadcrumbAttribute(): Collection
    {
        $breadcrumb = collect();
        $current = $this;
        
        while ($current) {
            $breadcrumb->prepend([
                'id' => $current->id,
                'name' => $current->name,
                'slug' => $current->slug,
            ]);
            $current = $current->parent;
        }
        
        return $breadcrumb;
    }

    public function getIsLeafAttribute(): bool
    {
        return $this->children()->count() === 0;
    }

    public function getHasProductsAttribute(): bool
    {
        return $this->products()->exists();
    }

    /* ------------------------------------------------------------------ */
    /* Méthodes pour la hiérarchie                                        */
    /* ------------------------------------------------------------------ */
    public function getDescendants(): Collection
    {
        $descendants = collect();
        
        foreach ($this->children as $child) {
            $descendants->push($child);
            $descendants = $descendants->merge($child->getDescendants());
        }
        
        return $descendants;
    }

    public function getAncestors(): Collection
    {
        $ancestors = collect();
        $parent = $this->parent;
        
        while ($parent) {
            $ancestors->push($parent);
            $parent = $parent->parent;
        }
        
        return $ancestors->reverse();
    }

    public function getAllProductsCount(): int
    {
        $count = $this->products()->count();
        
        foreach ($this->children as $child) {
            $count += $child->getAllProductsCount();
        }
        
        return $count;
    }

    /* ------------------------------------------------------------------ */
    /* Méthodes statiques utilitaires                                     */
    /* ------------------------------------------------------------------ */
    public static function getTree(): Collection
    {
        return static::with('allChildren')
            ->whereNull('parent_id')
            ->orderBy('sort_order')
            ->get();
    }

    public static function getFlatList(): Collection
    {
        return static::orderBy('level')
            ->orderBy('sort_order')
            ->get()
            ->map(function ($category) {
                $indent = str_repeat('— ', $category->level);
                return [
                    'id' => $category->id,
                    'name' => $indent . $category->name,
                    'level' => $category->level,
                    'parent_id' => $category->parent_id,
                ];
            });
    }

    /* ------------------------------------------------------------------ */
    /* Hooks du modèle                                                    */
    /* ------------------------------------------------------------------ */
    protected static function boot(): void
    {
        parent::boot();

        static::creating(function (Category $category) {
            if ($category->parent_id) {
                $parent = static::find($category->parent_id);
                $category->level = $parent ? $parent->level + 1 : 0;
            }
        });

        static::updating(function (Category $category) {
            if ($category->isDirty('parent_id')) {
                if ($category->parent_id) {
                    $parent = static::find($category->parent_id);
                    $category->level = $parent ? $parent->level + 1 : 0;
                } else {
                    $category->level = 0;
                }
                
                // Mettre à jour le niveau des enfants
                $category->updateChildrenLevels();
            }
        });
    }

    private function updateChildrenLevels(): void
    {
        foreach ($this->children as $child) {
            $child->update(['level' => $this->level + 1]);
            $child->updateChildrenLevels();
        }
    }
}