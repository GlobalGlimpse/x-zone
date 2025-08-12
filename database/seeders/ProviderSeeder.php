<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Provider;

class ProviderSeeder extends Seeder
{
    public function run(): void
    {
        $providers = [
            [
                'name' => 'Dell Technologies',
                'email' => 'contact@dell.com',
                'phone' => '+33 1 23 45 67 89',
                'address' => '123 Avenue des Champs-Élysées, 75008 Paris, France',
                'contact_person' => 'Jean Dupont',
                'is_active' => true,
            ],
            [
                'name' => 'HP Inc.',
                'email' => 'sales@hp.com',
                'phone' => '+33 1 98 76 54 32',
                'address' => '456 Rue de Rivoli, 75001 Paris, France',
                'contact_person' => 'Marie Martin',
                'is_active' => true,
            ],
            [
                'name' => 'Lenovo Group',
                'email' => 'info@lenovo.com',
                'phone' => '+33 1 11 22 33 44',
                'address' => '789 Boulevard Saint-Germain, 75007 Paris, France',
                'contact_person' => 'Pierre Durand',
                'is_active' => true,
            ],
            [
                'name' => 'ASUS Computer',
                'email' => 'contact@asus.fr',
                'phone' => '+33 1 55 66 77 88',
                'address' => '321 Rue de la Paix, 75002 Paris, France',
                'contact_person' => 'Sophie Leroy',
                'is_active' => true,
            ],
            [
                'name' => 'Distributeur Local IT',
                'email' => 'ventes@localit.fr',
                'phone' => '+33 1 44 55 66 77',
                'address' => '654 Avenue Montaigne, 75008 Paris, France',
                'contact_person' => 'Thomas Bernard',
                'is_active' => true,
            ],
        ];

        foreach ($providers as $provider) {
            Provider::create($provider);
        }
    }
}
