<?php

namespace App\Http\Controllers;

use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;
use Spatie\Activitylog\Models\Activity;
use Maatwebsite\Excel\Facades\Excel;

class AuditLogExportController extends Controller implements FromCollection, WithHeadings, WithStyles, ShouldAutoSize
{
    /**
     * Construit la collection de données à exporter.
     */
    public function collection(): Collection
    {
        return Activity::with(['causer', 'subject'])->get()->map(function (Activity $log) {
            $subjectName = $log->subject?->name ?? 'N/A';
            $details     = '';

            switch ($log->description) {
                case 'Modification des rôles':
                    $props   = $log->properties->toArray();
                    $details = "Modifications des rôles pour l'utilisateur {$subjectName}:\n";

                    if (!empty($props['roles_précédents'] ?? [])) {
                        $details .= "- Anciens rôles: " . implode(', ', $props['roles_précédents']) . "\n";
                    }
                    if (!empty($props['nouveaux_roles'] ?? [])) {
                        $details .= "- Nouveaux rôles: " . implode(', ', $props['nouveaux_roles']) . "\n";
                    }
                    if (!empty($props['roles_ajoutés'] ?? [])) {
                        $details .= "- Rôles ajoutés: " . implode(', ', $props['roles_ajoutés']) . "\n";
                    }
                    if (!empty($props['roles_supprimés'] ?? [])) {
                        $details .= "- Rôles supprimés: " . implode(', ', $props['roles_supprimés']) . "\n";
                    }
                    break;

                case 'Changement de mot de passe':
                    $details = "Le mot de passe de l'utilisateur \"{$subjectName}\" a été modifié";
                    break;

                default:
                    // Ignorer les updates vides
                    if (
                        $log->description === 'updated' &&
                        ($log->properties === null || $log->properties->isEmpty())
                    ) {
                        return null;
                    }

                    if ($log->properties && $log->properties->isNotEmpty()) {
                        $props = $log->properties->toArray();

                        if (!empty($props['attributes'] ?? [])) {
                            $hasChanges = false;
                            foreach ($props['attributes'] as $key => $value) {
                                if (in_array($key, ['password', 'remember_token']) || $value === null || $value === '') {
                                    continue;
                                }

                                $oldValue = $props['old'][$key] ?? 'non défini';
                                $details .= "- {$key}: {$oldValue} → {$value}\n";
                                $hasChanges = true;
                            }
                            if (!$hasChanges) {
                                $details = "Aucune modification n'a été apportée";
                            }
                        }
                    }
            }

            // Si aucun détail pertinent, on n’exporte pas l’entrée
            if (empty(trim($details))) {
                return null;
            }

            return [
                'ID'          => $log->id,
                'Utilisateur' => $log->causer?->name ?? 'Système',
                'Email'       => $log->causer?->email ?? 'N/A',
                'Action'      => $log->description,
                'Type'        => $log->subject_type,
                'ID Sujet'    => $log->subject_id,
                'Détails'     => $details,
                'Date'        => $log->created_at->format('d/m/Y H:i:s'),
            ];
        })->filter(); // supprime les entrées null
    }

    /**
     * En-têtes de la feuille Excel.
     */
    public function headings(): array
    {
        return [
            'ID',
            'Utilisateur',
            'Email',
            'Action',
            'Type',
            'ID Sujet',
            'Détails',
            'Date',
        ];
    }

    /**
     * Styles de la feuille Excel.
     */
    public function styles(Worksheet $sheet)
    {
        // Style de l’en-tête
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font' => [
                'bold'  => true,
                'color' => ['rgb' => 'FFFFFF'],
                'size'  => 11,
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4A5568'],
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Bordures + alignement vertical global
        $sheet->getStyle('A1:H' . $sheet->getHighestRow())->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['rgb' => 'E2E8F0'],
                ],
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
        ]);

        // Centrages spécifiques
        $sheet->getStyle('A2:A' . $sheet->getHighestRow())
              ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('E2:F' . $sheet->getHighestRow())
              ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle('H2:H' . $sheet->getHighestRow())
              ->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Wrap texte pour la colonne Détails
        $sheet->getStyle('G2:G' . $sheet->getHighestRow())
              ->getAlignment()->setWrapText(true);

        // Hauteur de la ligne d’en-tête
        $sheet->getRowDimension(1)->setRowHeight(25);

        // Bandes alternées (gris clair)
        for ($row = 2; $row <= $sheet->getHighestRow(); $row++) {
            if ($row % 2 === 0) {
                $sheet->getStyle("A{$row}:H{$row}")->applyFromArray([
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => 'F7FAFC'],
                    ],
                ]);
            }
        }

        return $sheet;
    }

    /**
     * Téléchargement du fichier.
     */
    public function export()
    {
        return Excel::download(
            $this,
            'journal_activites_' . now()->format('d-m-Y_H-i-s') . '.xlsx'
        );
    }
}
