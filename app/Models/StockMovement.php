<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\{BelongsTo, HasMany};
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

/**
 * @property string      $unit_cost   Montant à 2 décimales (string)
 * @property string|null $total_cost  Montant à 2 décimales (string)
 */
class StockMovement extends Model
{
    use LogsActivity, SoftDeletes;

    /* ─────────── Remplissage ─────────── */
    protected $fillable = [
        'product_id',
        'type',
        'quantity',
        'reference',
        'provider_id',
        'reason_id',
        'unit_cost',
        'total_cost',
        'currency_code',
        'user_id',
        'notes',
        'movement_date',
    ];

    protected $casts = [
        'quantity'      => 'integer',
        'unit_cost'     => 'decimal:2',
        'total_cost'    => 'decimal:2',
        'movement_date' => 'datetime',
        'deleted_at'    => 'datetime',
    ];

    /* ─────────── Relations ─────────── */
    public function product(): BelongsTo        { return $this->belongsTo(Product::class); }
    public function user(): BelongsTo           { return $this->belongsTo(User::class); }
    public function provider(): BelongsTo       { return $this->belongsTo(Provider::class); }
    public function movementReason(): BelongsTo { return $this->belongsTo(StockMovementReason::class, 'reason_id'); }
    public function currency(): BelongsTo       { return $this->belongsTo(Currency::class, 'currency_code', 'code'); }
    public function attachments(): HasMany      { return $this->hasMany(StockMovementAttachment::class); }

    /* ─────────── Accessors ─────────── */
    public function getFormattedQuantityAttribute(): string
    {
        return $this->quantity >= 0 ? "+{$this->quantity}" : (string) $this->quantity;
    }

    public function getSupplierNameAttribute(): string
    {
        return $this->provider?->name ?? 'Non spécifié';
    }

    public function getReasonNameAttribute(): string
    {
        return $this->movementReason?->name ?? 'Non spécifié';
    }

    /* ─────────── Activity-log ─────────── */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('stock_movement')
            ->logAll()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->setDescriptionForEvent(
                fn (string $event) => "Stock movement has been {$event}"
            );
    }

    /* ─────────── Hooks ─────────── */
    protected static function boot(): void
    {
        parent::boot();

        // Calcule total_cost (unit_cost × |quantity|)
        static::saving(static function (self $m): void {
            if ($m->unit_cost !== null && $m->quantity) {
                $m->total_cost = (string) ((float) $m->unit_cost * abs($m->quantity));
            }
        });
    }
}
