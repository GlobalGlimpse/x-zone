<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\StockMovementReason;

class StockMovementReasonSeeder extends Seeder
{
    public function run(): void
    {
        $reasons = [
            // Motifs d'entrée
            [
                'name' => 'Achat fournisseur',
                'type' => 'in',
                'description' => 'Réception de marchandises suite à un achat auprès d\'un fournisseur',
                'is_active' => true,
            ],
            [
                'name' => 'Retour client',
                'type' => 'in',
                'description' => 'Produit retourné par un client',
                'is_active' => true,
            ],
            [
                'name' => 'Transfert entrant',
                'type' => 'in',
                'description' => 'Transfert de stock depuis un autre entrepôt',
                'is_active' => true,
            ],
            [
                'name' => 'Production interne',
                'type' => 'in',
                'description' => 'Produits assemblés ou fabriqués en interne',
                'is_active' => true,
            ],

            // Motifs de sortie
            [
                'name' => 'Vente client',
                'type' => 'out',
                'description' => 'Sortie de stock pour une vente à un client',
                'is_active' => true,
            ],
            [
                'name' => 'Retour fournisseur',
                'type' => 'out',
                'description' => 'Retour de marchandises défectueuses au fournisseur',
                'is_active' => true,
            ],
            [
                'name' => 'Transfert sortant',
                'type' => 'out',
                'description' => 'Transfert de stock vers un autre entrepôt',
                'is_active' => true,
            ],
            [
                'name' => 'Casse/Perte',
                'type' => 'out',
                'description' => 'Produit cassé, perdu ou détérioré',
                'is_active' => true,
            ],
            [
                'name' => 'Utilisation interne',
                'type' => 'out',
                'description' => 'Utilisation du produit pour les besoins internes de l\'entreprise',
                'is_active' => true,
            ],

            // Motifs d'ajustement
            [
                'name' => 'Inventaire physique',
                'type' => 'adjustment',
                'description' => 'Ajustement suite à un inventaire physique',
                'is_active' => true,
            ],
            [
                'name' => 'Correction d\'erreur',
                'type' => 'adjustment',
                'description' => 'Correction d\'une erreur de saisie précédente',
                'is_active' => true,
            ],

            // Motifs génériques (tous types)
            [
                'name' => 'Autre',
                'type' => 'all',
                'description' => 'Autre motif non listé',
                'is_active' => true,
            ],
        ];

        foreach ($reasons as $reason) {
            StockMovementReason::create($reason);
        }
    }
}
