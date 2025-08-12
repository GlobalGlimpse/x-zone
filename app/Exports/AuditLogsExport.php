<?php

namespace App\Exports;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Spatie\Activitylog\Models\Activity;
use Carbon\Carbon;

class AuditLogsExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    protected array $filters;

    public function __construct(array $filters)
    {
        $this->filters = $filters;
    }

    public function collection(): Collection
    {
        $query = Activity::select('id', 'description', 'subject_type', 'subject_id', 'causer_id', 'properties', 'created_at')
                         ->with(['causer:id,name,email']);

        if (!empty($this->filters['search'])) {
            $search = $this->filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('subject_type', 'like', "%{$search}%")
                  ->orWhere('subject_id', 'like', "%{$search}%")
                  ->orWhereHas('causer', function ($cq) use ($search) {
                      $cq->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($this->filters['user'])) {
            $userInput = trim(strtolower($this->filters['user']));
            if ($userInput === '__system__') {
                $query->whereNull('causer_id');
            } else {
                $query->whereHas('causer', function ($q) {
                    $q->where('name', 'like', '%' . $this->filters['user'] . '%')
                      ->orWhere('email', 'like', '%' . $this->filters['user'] . '%');
                });
            }
        }

        if (!empty($this->filters['action'])) {
            $query->where('description', 'like', '%' . $this->filters['action'] . '%');
        }

        if (!empty($this->filters['subject_type'])) {
            $query->where('subject_type', $this->filters['subject_type']);
        }

        if (!empty($this->filters['start_date']) && !empty($this->filters['end_date'])) {
            $query->whereBetween('created_at', [
                Carbon::parse($this->filters['start_date'])->startOfDay(),
                Carbon::parse($this->filters['end_date'])->endOfDay(),
            ]);
        }

        return $query->get()->map(function (Activity $activity) {
            return [
                'ID'          => $activity->id,
                'Utilisateur' => $activity->causer?->name ?? 'Système',
                'Email'       => $activity->causer?->email ?? '—',
                'Action'      => $activity->description,
                'Modèle'      => class_basename($activity->subject_type),
                'Date'        => $activity->created_at->format('d/m/Y H:i:s'),
                'Détail'      => json_encode($activity->properties?->toArray(), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT),
            ];
        });
    }

    public function headings(): array
    {
        return ['ID', 'Utilisateur', 'Email', 'Action', 'Modèle', 'Date', 'Détail'];
    }

    public function styles(Worksheet $sheet)
    {
        $rowCount = $sheet->getHighestRow();

        // Style pour l'en-tête
        $sheet->getStyle('A1:G1')->applyFromArray([
            'font' => [
                'bold'  => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size'  => 11,
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4A5568'], // Gris foncé
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Style général des cellules
        $sheet->getStyle("A1:G{$rowCount}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['rgb' => 'E2E8F0'], // Gris clair
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
        ]);

        // Centrage pour colonnes spécifiques
        $sheet->getStyle("A2:A{$rowCount}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("F2:F{$rowCount}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Hauteur de l'en-tête
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Style alterné pour les lignes
        for ($row = 2; $row <= $rowCount; $row++) {
            if ($row % 2 === 0) {
                $sheet->getStyle("A{$row}:G{$row}")->applyFromArray([
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F7FAFC'], // Gris très clair
                    ],
                ]);
            }
        }

        return $sheet;
    }
}
