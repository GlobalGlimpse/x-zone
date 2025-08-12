<?php

namespace App\Models;

class PowerSupply extends SpecializedProduct
{
    // 🔧 Clé primaire basée sur UUID (comme dans GraphicCard)
    protected $primaryKey = 'product_id';
    public $incrementing  = false;
    protected $keyType    = 'string';

    // 🎯 Casting automatique des types
    protected $casts = [
        'power'               => 'integer',
        'modular'             => 'boolean',
        'connector_types'     => 'array',
        'protection_features' => 'array',
    ];

    // ✅ Champs mass-assignables
    protected $fillable = [
        'product_id',
        'power',
        'efficiency_rating',
        'modular',
        'form_factor',
        'connector_types',
        'protection_features',
    ];

    // 🧩 Relation inverse (si besoin)
    public function product()
    {
        return $this->belongsTo(Product::class, 'product_id');
    }
}
