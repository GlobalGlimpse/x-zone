<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Facture {{ $invoice->number }}</title>

    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

    <style>
        :root{
            --main:#1B1749;          /* bleu */
            --accent:#E92B26;        /* rouge */
            --gray-light:#F8F9FD;
            --gray-mid:#ECECF7;
        }

        /* ---------- GÉNÉRAL ---------- */
        html,body{height:100%}                       /* (1) pour le pied de page collé */
        *{margin:0;padding:0;box-sizing:border-box}
        body{font-family:'Poppins',Arial,sans-serif;font-size:12px;line-height:1.4;color:var(--main)}

        .wrap{
            max-width:820px;margin:0 auto;background:#fff;border-radius:20px;
            box-shadow:0 6px 32px #0001;overflow:hidden;
            display:flex;flex-direction:column;min-height:100%; /* (1) conteneur flex */
        }

        /* ---------- HEADER ---------- */
        .header{background:var(--main);color:#fff;padding:42px 48px 72px;position:relative}
        .header::after{
            content:'';position:absolute;left:0;right:0;bottom:-1px;height:35px;
            background:var(--accent);clip-path:ellipse(120% 100% at 50% 0%);
        }
        .logo-txt{font-size:27px;font-weight:700;letter-spacing:.04em}
        .header-info{position:absolute;right:48px;top:46px;text-align:right}
        .header-info h2{font-size:22px;font-weight:800;margin-bottom:4px}
        .header-info .num{font-size:16px;font-weight:600}
        .header-info .date{font-size:12px;opacity:.75}

        /* ---------- SECTIONS ---------- */
        section{padding:24px 48px}
        .title-small{font-size:13px;font-weight:700;color:var(--accent);margin-bottom:6px;text-transform:uppercase}
        .text-muted{color:#6b6f8d}

        /* ---------- TABLE CLIENT / ÉMETTEUR ---------- */
        table.info-two-col{width:100%;font-size:12px}

        /* ---------- TABLE ARTICLES ---------- */
        table.items{
            width:100%;border-collapse:collapse;font-size:12px;border:1px solid var(--gray-mid);
            table-layout:fixed;                          /* (2) largeur fixe */
        }
        table.items thead th{
            background-color:#1B1749 !important;color:#fff !important;
            padding:10px 8px;font-weight:600;letter-spacing:.05em;
            border-right:1px solid #ffffff25
        }
        table.items thead th:first-child{border-top-left-radius:6px}
        table.items thead th:last-child{border-top-right-radius:6px;border-right:none}
        table.items tbody td{padding:10px 8px;border-right:1px solid #ffffff10;border-bottom:1px solid var(--gray-mid)}
        table.items tbody td:last-child{border-right:none}
        table.items tbody tr:nth-child(even) td{background:var(--gray-light)}
        .text-r{text-align:right}

        /* (2) répartition des largeurs */
        table.items th:nth-child(1){width:4%}           /* # */
        table.items th:nth-child(2),
        table.items td:nth-child(2){
            width:38%;word-break:break-word;            /* Désignation */
        }
        table.items th:nth-child(3){width:14%}          /* SKU */
        table.items th:nth-child(4){width:8%}           /* Qté */
        table.items th:nth-child(5),
        table.items th:nth-child(6),
        table.items th:nth-child(7){width:12%}          /* PU HT / Total HT / TTC */

        /* ---------- TOTAUX ---------- */
        .totals-card{
            margin:24px 0 0 auto;width:320px;background:#fff;border-radius:18px;
            box-shadow:0 4px 22px #1B174912;font-size:13px
        }
        .totals-card .row{display:flex;justify-content:space-between;padding:10px 18px}
        .totals-card .row:nth-child(odd){background:#FAFAFE}
        .totals-card .label{color:#6b6f8d;font-weight:600}
        .totals-card .val{font-weight:600}
        .totals-card .grand{
            background:#E92B26 !important;color:#fff !important;
            font-size:18px;font-weight:700;letter-spacing:.05em
        }

        /* ---------- FOOTER ---------- */
        .footer-flex{display:flex;gap:40px}
        .footer-flex .box{flex:1}
        .signature{height:60px;border:1.5px dashed var(--gray-mid);border-radius:10px;margin-top:10px}
        .mini-footer{
            background:var(--gray-light);color:#7b7f9c;text-align:right;
            padding:6px 48px;font-size:11px;
            margin-top:auto;                             /* (1) pousse en bas */
        }

        /* ---------- STATUT PAYÉ ---------- */
        .paid-stamp {
            position: absolute;
            top: 50%;
            right: 48px;
            transform: translateY(-50%) rotate(-15deg);
            background: #10B981;
            color: white;
            padding: 8px 16px;
            border: 3px solid #10B981;
            border-radius: 12px;
            font-weight: 700;
            font-size: 14px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }

        /* ---------- STATUT refunded ---------- */
        .refunded-stamp {
            position: absolute;
            top: 50%;
            right: 48px;
            transform: translateY(-50%) rotate(-15deg);
            background: RED;
            color: white;
            padding: 8px 16px;
            border: 3px solid red;
            border-radius: 12px;
            font-weight: 700;
            font-size: 12px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
            box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3);
        }

        .overdue-stamp {
            background: #EF4444;
            border-color: #EF4444;
            box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3);
        }

        /* ---------- RESPONSIVE ---------- */
        @media(max-width:680px){
            .wrap,.header,section{padding:24px}
            .header-info{right:24px;top:28px}
            .footer-flex{flex-direction:column}
            .totals-card{width:100%}
            .paid-stamp{right:24px;font-size:12px;padding:6px 12px}
        }
    </style>
</head>
<body>
<div class="wrap">

    <!-- HEADER -->
    <header class="header">
        <div class="logo-txt">x-Zone&nbsp;Technologie</div>
        <div class="header-info">
            <h2>FACTURE</h2>
            <div class="num">N° {{ $invoice->number }}</div>
            <div class="date">Émise le {{ $invoice->date->format('d/m/Y') }}</div>
            <div class="date">Échéance le {{ $invoice->due_date->format('d/m/Y') }}</div>
        </div>

        <!-- Tampon de statut pour les factures payées ou en retard -->
        @if($invoice->status === 'paid')
            <div class="paid-stamp">PAYÉE</div>
        @elseif($invoice->status === 'refunded')
            <div class="paid-stamp refunded-stamp">REMBOURSÉE</div>
        @elseif($invoice->status === 'overdue')
            <div class="paid-stamp overdue-stamp">EN RETARD</div>
        @endif
    </header>

    <!-- CLIENT & ÉMETTEUR -->
    <section>
        <table class="info-two-col">
            <tr>
                <td style="width:50%;vertical-align:top">
                    <div class="title-small">Facturé à</div>
                    <strong>{{ $invoice->client->company_name }}</strong><br>
                    @if($invoice->client->contact_name) {{ $invoice->client->contact_name }}<br>@endif
                    @if($invoice->client->address) {{ $invoice->client->address }}<br>@endif
                    @if($invoice->client->city || $invoice->client->postal_code) {{ $invoice->client->postal_code }} {{ $invoice->client->city }}<br>@endif
                    @if($invoice->client->country) {{ $invoice->client->country }}<br>@endif
                    @if($invoice->client->email)<span class="text-muted">Email :</span> {{ $invoice->client->email }}<br>@endif
                    @if($invoice->client->phone)<span class="text-muted">Tél :</span> {{ $invoice->client->phone }}<br>@endif
                </td>
                <td style="width:50%;vertical-align:top;text-align:right">
                    <div class="title-small">Émetteur</div>
                    <strong>x-Zone&nbsp;Technologie</strong><br>
                    11/13, Rue 71, Bd. Taza, Hay My<br>
                    Casablanca 20152, Maroc<br>
                    Tél : +212 522-523-232<br>
                    contact@x-zone.ma<br>
                    ICE : 001533307000020
                </td>
            </tr>
        </table>
    </section>

    <!-- TABLE ARTICLES -->
    <section>
        <table class="items">
            <thead>
            <tr>
                <th style="text-align:center">#</th>
                <th style="text-align:center">Désignation</th>
                <th style="text-align:center">SKU</th>
                <th style="text-align:center">Qté</th>
                <th style="text-align:center">PU&nbsp;HT</th>
                <th style="text-align:center">Total&nbsp;HT</th>
                <th style="text-align:center">Total&nbsp;TTC</th>
            </tr>
            </thead>
            <tbody>
            @php
                $i=1;$totalHT=$totalTVA=$totalTTC=0;
            @endphp
            @foreach($invoice->lines as $line)
                @php
                    $pu  = $line->unit_price_ht ?? $line->product->price_ht ?? 0;
                    $tax = $line->tax_rate ?? optional($line->product->taxRate)->rate ?? 0;
                    $ht  = $pu * $line->quantity;
                    $tva = $ht * $tax / 100;
                    $ttc = $ht + $tva;
                    $totalHT+=$ht;$totalTVA+=$tva;$totalTTC+=$ttc;
                @endphp
                <tr>
                    <td style="text-align:center">{{ $i++ }}</td>
                    <td>
                        <strong>{{ $line->designation ?? $line->product->name ?? '' }}</strong>
                        @if($d = $line->product->description ?? '')
                            <br><span class="text-muted" style="font-size:11px">{{ $d }}</span>
                        @endif
                    </td>
                    <td style="text-align:center">{{ $line->product->sku ?? '' }}</td>
                    <td style="text-align:center">{{ number_format($line->quantity,2,',',' ') }}</td>
                    <td style="text-align:center">{{ number_format($pu,2,',',' ') }}</td>
                    <td style="text-align:center">{{ number_format($ht,2,',',' ') }}</td>
                    <td style="text-align:center">{{ number_format($ttc,2,',',' ') }}</td>
                </tr>
            @endforeach
            </tbody>
        </table>

        <!-- TOTAUX -->
        <div class="totals-card">
            <div class="row"><span class="label">Sous-total HT </span><span class="val">{{ number_format($totalHT,2,',',' ') }} {{ config('app.currency_code', 'MAD') }}</span></div>
            <div class="row"><span class="label">TVA </span><span class="val">{{ number_format($totalTVA,2,',',' ') }} {{ config('app.currency_code', 'MAD') }}</span></div>
            <div class="row grand"><span>TOTAL TTC </span><span>{{ number_format($totalTTC,2,',',' ') }} {{ config('app.currency_code', 'MAD') }}</span></div>
        </div>
    </section>

    <!-- FOOTER -->
    <section>
        <div class="footer-flex">
            <div class="box">
                <div class="title-small">Paiement</div>
                Virement bancaire – IBAN : MA19 0123 4567 8900 1234 5678 90<br><br>

                <div class="title-small">Échéance</div>
                @php
                    $daysUntilDue = now()->diffInDays($invoice->due_date, false);
                    $isOverdue = $daysUntilDue < 0;
                @endphp
                @if($invoice->status === 'paid')
                    <span style="color:#10B981;font-weight:600">✓ Facture payée</span>
                @elseif($isOverdue)
                    <span style="color:var(--accent);font-weight:600">⚠ En retard de {{ abs($daysUntilDue) }} jour{{ abs($daysUntilDue) > 1 ? 's' : '' }}</span>
                @else
                    Paiement dû dans {{ $daysUntilDue }} jour{{ $daysUntilDue > 1 ? 's' : '' }}
                @endif
                <br><br>

                @if($invoice->notes)
                    <div class="title-small">Notes</div>
                    <div style="font-size:11px">{!! nl2br(e($invoice->notes)) !!}</div><br>
                @endif

                @if($invoice->terms_conditions)
                    <div class="title-small">Conditions</div>
                    <div style="font-size:11px">{!! nl2br(e($invoice->terms_conditions)) !!}</div>
                @endif
            </div>
            <div class="box">
                <div class="title-small">Signature & Cachet</div>
                <div class="signature"></div>
            </div>
        </div>
    </section>

    <!-- Mini footer avec informations légales -->
    <div class="mini-footer">
        Document généré le {{ now()->format('d/m/Y à H:i') }} •
        En cas de retard de paiement, des pénalités peuvent s'appliquer
    </div>

</div>
</body>
</html>
