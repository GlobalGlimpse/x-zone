<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;

class Invoice extends Model
{
    use HasUuids, SoftDeletes;

    // ✅ Statuts alignés EXACTEMENT sur ta migration
    public const STATUS_DRAFT          = 'draft';
    public const STATUS_SENT           = 'sent';
    public const STATUS_ISSUED         = 'issued';
    public const STATUS_PAID           = 'paid';
    public const STATUS_PARTIALLY_PAID = 'partially_paid';
    public const STATUS_CANCELLED      = 'cancelled';
    public const STATUS_REFUNDED = 'refunded';

    public static function statuses(): array
    {
        return [
            self::STATUS_DRAFT,
            self::STATUS_SENT,
            self::STATUS_ISSUED,
            self::STATUS_PAID,
            self::STATUS_PARTIALLY_PAID,
            self::STATUS_CANCELLED,
            self::STATUS_REFUNDED,
        ];
    }

    protected $fillable = [
        'client_id',
        'number',
        'status',
        'date',
        'due_date',
        'currency_id',
        'notes',
        'terms_conditions',
        'internal_notes',
        'total_ht',
        'total_tva',
        'total_ttc',
        'quote_id',
    ];

    protected $casts = [
        'date'        => 'date',
        'due_date'    => 'date',
        'total_ht'    => 'decimal:2',
        'total_tva'   => 'decimal:2',
        'total_ttc'   => 'decimal:2',
        'deleted_at'  => 'datetime',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($invoice) {
            if (empty($invoice->number)) {
                $invoice->number = self::generateInvoiceNumber();
            }
            if (empty($invoice->status)) {
                $invoice->status = self::STATUS_DRAFT;
            }
        });
    }

    public static function generateInvoiceNumber(string $prefix = 'FAC', int $padding = 6): string
    {
        $year = now()->year;

        // ASTUCE: idéalement appeler dans une transaction pour que lockForUpdate soit 100% efficace
        $last = static::whereYear('date', $year)
            ->where('number', 'like', "{$prefix}-{$year}-%")
            ->orderByDesc('number')
            ->lockForUpdate()
            ->first();

        $seq = 1;
        if ($last && preg_match("/^{$prefix}-{$year}-(\d{{$padding}})$/", $last->number, $m)) {
            $seq = (int) $m[1] + 1;
        }

        return sprintf("%s-%d-%0{$padding}d", $prefix, $year, $seq);
    }

    // ── Relations
    public function client()
    {
        return $this->belongsTo(Client::class);
    }

    public function lines()
    {
        return $this->hasMany(InvoiceLine::class);
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class);
    }

    public function statusHistories()
    {
        return $this->hasMany(InvoiceStatusHistory::class);
    }

    // ── Méthodes métier
    public function calculateTotals(): void
    {
        $totals = $this->lines->reduce(function ($carry, $line) {
            $lineHt  = ($line->quantity ?? 0) * ($line->unit_price_ht ?? 0);
            $lineTva = $lineHt * (($line->tax_rate ?? 0) / 100);

            $carry['ht']  += $lineHt;
            $carry['tva'] += $lineTva;

            return $carry;
        }, ['ht' => 0, 'tva' => 0]);

        $this->update([
            'total_ht'  => $totals['ht'],
            'total_tva' => $totals['tva'],
            'total_ttc' => $totals['ht'] + $totals['tva'],
        ]);
    }

    public function isOverdue(): bool
    {
        // "en retard" = date d’échéance passée, et pas soldée/annulée
        return $this->due_date
            && $this->due_date->isPast()
            && in_array($this->status, [
                self::STATUS_SENT,
                self::STATUS_ISSUED,
                self::STATUS_PARTIALLY_PAID,
            ], true);
    }

    public function canBeEdited(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public function canBeDeleted(): bool
    {
        return in_array($this->status, [self::STATUS_DRAFT, self::STATUS_CANCELLED], true);
    }

    public function canBeReopened(): bool
    {
        return $this->status === self::STATUS_REFUNDED;
    }
}
