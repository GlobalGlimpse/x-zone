<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use App\Models\LoginLog;
use Maatwebsite\Excel\Facades\Excel;

class LoginLogExportController extends Controller implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    public function collection()
    {
        return LoginLog::with('user')->orderBy('created_at', 'desc')->get()->map(function ($log) {
            // Format browser info
            $browserInfo = '';
            if (!empty($log->user_agent)) {
                $platform = $this->getPlatform($log->user_agent);
                $browser = $this->getBrowser($log->user_agent);
                $browserInfo = "Navigateur: {$browser}\nPlateforme: {$platform}";
            }

            // Format status
            $status = $log->status === 'success' ? 'Réussie' : 'Échouée';

            // Get user info safely
            $userName = $log->user ? $log->user->name : 'Utilisateur inconnu';
            $userEmail = $log->user ? $log->user->email : 'N/A';
            $userRoles = $log->user && $log->user->roles ? implode(', ', $log->user->roles->pluck('name')->toArray()) : 'N/A';

            return [
                'ID' => $log->id,
                'Utilisateur' => $userName,
                'Email' => $userEmail,
                'Rôles' => $userRoles,
                'Statut' => $status,
                'Adresse IP' => $log->ip_address,
                'Détails Navigateur' => $browserInfo,
                'Localisation' => $log->location ?: 'Non disponible',
                'Date' => $log->created_at->format('d/m/Y H:i:s'),
            ];
        });
    }

    public function headings(): array
    {
        return [
            'ID',
            'Utilisateur',
            'Email',
            'Rôles',
            'Statut',
            'Adresse IP',
            'Détails Navigateur',
            'Localisation',
            'Date',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Count rows for styling
        $rowCount = $sheet->getHighestRow();

        // Style pour l'en-tête
        $sheet->getStyle('A1:I1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size' => 11,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4A5568'], // Gris foncé
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Style pour toutes les cellules
        $sheet->getStyle('A1:I' . $rowCount)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => 'E2E8F0'], // Gris clair
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Centrage pour les colonnes ID, Statut et Date
        $sheet->getStyle('A2:A' . $rowCount)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('E2:E' . $rowCount)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('I2:I' . $rowCount)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Ajustement du format pour les colonnes détaillées
        $sheet->getStyle('G2:H' . $rowCount)->getAlignment()->setWrapText(true);

        // Hauteur de la première ligne
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Style alterné pour les lignes
        for ($row = 2; $row <= $rowCount; $row++) {
            if ($row % 2 == 0) {
                $sheet->getStyle('A' . $row . ':I' . $row)->applyFromArray([
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F7FAFC'], // Gris très clair
                    ],
                ]);
            }
        }

        // Style conditionnel pour les statuts de connexion
        for ($row = 2; $row <= $rowCount; $row++) {
            $statusValue = $sheet->getCell('E' . $row)->getValue();

            if ($statusValue === 'Réussie') {
                $sheet->getStyle('E' . $row)->applyFromArray([
                    'font' => [
                        'color' => ['rgb' => '047857'], // Vert
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'ECFDF5'], // Fond vert pâle
                    ],
                ]);
            } elseif ($statusValue === 'Échouée') {
                $sheet->getStyle('E' . $row)->applyFromArray([
                    'font' => [
                        'color' => ['rgb' => 'DC2626'], // Rouge
                    ],
                    'fill' => [
                        'fillType' => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'FEF2F2'], // Fond rouge pâle
                    ],
                ]);
            }
        }

        return $sheet;
    }

    private function getPlatform(string $userAgent): string
    {
        $platforms = [
            'Windows' => '/windows|win32/i',
            'Mac' => '/macintosh|mac os x/i',
            'Linux' => '/linux/i',
            'iOS' => '/iphone|ipad|ipod/i',
            'Android' => '/android/i',
        ];

        foreach ($platforms as $platform => $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return $platform;
            }
        }

        return 'Inconnu';
    }

    private function getBrowser(string $userAgent): string
    {
        $browsers = [
            'Chrome' => '/chrome/i',
            'Firefox' => '/firefox/i',
            'Safari' => '/safari/i',
            'Edge' => '/edge/i',
            'Opera' => '/opera|OPR/i',
            'Internet Explorer' => '/MSIE|Trident/i',
        ];

        foreach ($browsers as $browser => $pattern) {
            if (preg_match($pattern, $userAgent)) {
                return $browser;
            }
        }

        return 'Inconnu';
    }

    public function export()
    {
        return Excel::download($this, 'journal_connexions_' . now()->format('d-m-Y_H-i-s') . '.xlsx');
    }
}
