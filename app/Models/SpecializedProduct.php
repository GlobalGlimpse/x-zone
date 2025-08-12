<?php
// app/Models/SpecializedProduct.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;

abstract class SpecializedProduct extends Model
{
    use HasFactory, SoftDeletes;

    /** clef primaire = product_id (UUID) */
    protected $primaryKey  = 'product_id';
    public    $incrementing = false;
    protected $keyType      = 'string';

    // Autorise l’insertion en masse de TOUTES les colonnes
    protected $guarded = [];

    /** relation inverse */
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
