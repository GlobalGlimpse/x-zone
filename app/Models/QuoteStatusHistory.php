<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QuoteStatusHistory extends Model
{
    protected $fillable = [
        'quote_id',
        'user_id',
        'from_status',
        'to_status',
        'comment',
        'metadata',
    ];

    protected $casts = [
        'metadata' => 'array',
    ];

    /* ─────────── Relations ─────────── */
    public function quote(): BelongsTo
    {
        return $this->belongsTo(Quote::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /* ─────────── Helpers / Accessors ─────────── */
    public function getFormattedStatusChangeAttribute(): string
    {
        $from = $this->from_status ? $this->formatStatus($this->from_status) : 'Nouveau';
        $to   = $this->formatStatus($this->to_status);

        return "{$from} → {$to}";
    }

    private function formatStatus(string $status): string
    {
        return match ($status) {
            'draft'     => 'Brouillon',
            'sent'      => 'Envoyé',
            'viewed'    => 'Consulté',
            'accepted'  => 'Accepté',
            'rejected'  => 'Refusé',
            'expired'   => 'Expiré',
            'converted' => 'Converti',
            default     => ucfirst($status),
        };
    }
}
