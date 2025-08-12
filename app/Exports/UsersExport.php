<?php

namespace App\Exports;

use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

class UsersExport implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    public function collection(): Collection
    {
        return User::with('roles')->get()->map(function ($user) {
            return [
                'ID' => $user->id,
                'Nom' => $user->name,
                'Email' => $user->email,
                'Rôles' => implode(', ', $user->getRoleNames()->toArray()),
            ];
        });
    }

    public function headings(): array
    {
        return ['ID', 'Nom', 'Email', 'Rôles'];
    }

    public function styles(Worksheet $sheet)
    {
        $highestRow = $sheet->getHighestRow();

        // Couleurs cohérentes avec le thème sombre
        $headerBg = '1B1749'; // violet sombre
        $borderColor = '3B3B55';
        $altRow = '0e0a32';

        // Style pour l'en-tête
        $sheet->getStyle('A1:D1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $headerBg],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Bordures et alignement vertical
        $sheet->getStyle("A1:D{$highestRow}")->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['rgb' => $borderColor],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true,
            ],
        ]);

        // Centrage pour la colonne ID
        $sheet->getStyle("A2:A{$highestRow}")
              ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Hauteur de l'en-tête
        $sheet->getRowDimension(1)->setRowHeight(26);

        // Style alterné pour les lignes
        for ($row = 2; $row <= $highestRow; $row++) {
            if ($row % 2 === 0) {
                $sheet->getStyle("A{$row}:D{$row}")->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $altRow],
                    ],
                    'font' => [
                        'color' => ['rgb' => 'E2E8F0'],
                    ],
                ]);
            }
        }

        return $sheet;
    }
}
