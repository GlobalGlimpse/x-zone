<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Devis {{ $quote->quote_number }}</title>

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

        /* ---------- RESPONSIVE ---------- */
        @media(max-width:680px){
            .wrap,.header,section{padding:24px}
            .header-info{right:24px;top:28px}
            .footer-flex{flex-direction:column}
            .totals-card{width:100%}
        }
    </style>
</head>
<body>
<div class="wrap">

    <!-- HEADER -->
    <header class="header">
        <div class="logo-txt">x-Zone&nbsp;Technologie</div>
        <div class="header-info">
            <h2>DEVIS</h2>
            <div class="num">N° {{ $quote->quote_number }}</div>
            <div class="date">Émis le {{ $quote->quote_date->format('d/m/Y') }}</div>
            <div class="date">Valide jusqu'au {{ $quote->valid_until->format('d/m/Y') }}</div>
        </div>
    </header>

    <!-- CLIENT & ÉMETTEUR -->
    <section>
        <table class="info-two-col">
            <tr>
                <td style="width:50%;vertical-align:top">
                    <div class="title-small">Client</div>
                    <strong>{{ $quote->client->company_name }}</strong><br>
                    @if($quote->client->contact_name) {{ $quote->client->contact_name }}<br>@endif
                    @if($quote->client->address) {{ $quote->client->address }}<br>@endif
                    @if($quote->client->city || $quote->client->postal_code) {{ $quote->client->postal_code }} {{ $quote->client->city }}<br>@endif
                    @if($quote->client->country) {{ $quote->client->country }}<br>@endif
                    @if($quote->client->email)<span class="text-muted">Email :</span> {{ $quote->client->email }}<br>@endif
                    @if($quote->client->phone)<span class="text-muted">Tél :</span> {{ $quote->client->phone }}<br>@endif
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
                {{-- <th class="text-r">TVA&nbsp;%</th> --}}
                <th style="text-align:center">Total&nbsp;HT</th>
                <th style="text-align:center">Total&nbsp;TTC</th>
            </tr>
            </thead>
            <tbody>
            @php
                $i=1;$totalHT=$totalTVA=$totalTTC=0;
            @endphp
            @foreach($quote->items as $item)
                @php
                    $pu  = $item->unit_price_ht_snapshot ?? $item->product->price_ht ?? 0;
                    $tax = $item->tax_rate_snapshot ?? optional($item->product->taxRate)->rate ?? 0;
                    $ht  = $pu * $item->quantity;
                    $tva = $ht * $tax / 100;
                    $ttc = $ht + $tva;
                    $totalHT+=$ht;$totalTVA+=$tva;$totalTTC+=$ttc;
                @endphp
                <tr>
                    <td style="text-align:center">{{ $i++ }}</td>
                    <td>
                        <strong>{{ $item->product_name_snapshot ?? $item->product->name }}</strong>
                        @if($d=$item->product_description_snapshot ?? $item->product->description)
                            <br><span class="text-muted" style="font-size:11px">{{ $d }}</span>
                        @endif
                    </td>
                    <td style="text-align:center">{{ $item->product_sku_snapshot ?? $item->product->sku }}</td>
                    <td style="text-align:center">{{ number_format($item->quantity,2,',',' ') }}</td>
                    <td style="text-align:center">{{ number_format($pu,2,',',' ') }} </td>
                    {{-- <td class="text-r">{{ number_format($tax,1,',',' ') }} %</td> --}}
                    <td style="text-align:center">{{ number_format($ht,2,',',' ') }} </td>
                    <td style="text-align:center">{{ number_format($ttc,2,',',' ') }} </td>
                </tr>
            @endforeach
            </tbody>
        </table>

        <!-- TOTAUX -->
        <div class="totals-card">
            <div class="row"><span class="label">Sous-total HT </span><span class="val">{{ number_format($totalHT,2,',',' ') }} {{ $quote->currency_code }}</span></div>
            <div class="row"><span class="label">TVA </span><span class="val">{{ number_format($totalTVA,2,',',' ') }} {{ $quote->currency_code }}</span></div>
            <div class="row grand"><span>TOTAL TTC </span><span>{{ number_format($totalTTC,2,',',' ') }} {{ $quote->currency_code }}</span></div>
        </div>
    </section>

    <!-- FOOTER -->
    <section>
        <div class="footer-flex">
            <div class="box">
                <div class="title-small">Paiement</div>
                Virement bancaire – IBAN : MA19 0123 4567 8900 1234 5678 90<br><br>
                <div class="title-small">Validité</div>
                @php $days=$quote->quote_date->diffInDays($quote->valid_until,false); @endphp
                Ce devis est @if($days>0) valable {{ $days }} jours @else <span style="color:var(--accent);font-weight:600">expiré</span> @endif à compter de sa date d’émission.<br><br>
                @if($quote->terms_conditions)
                    <div class="title-small">Conditions</div>
                    <div style="font-size:11px">{!! nl2br(e($quote->terms_conditions)) !!}</div>
                @endif
            </div>
            <div class="box">
                <div class="title-small">Signature</div>
                <div class="signature"></div>
            </div>
        </div>
    </section>


</div>
</body>
</html>
