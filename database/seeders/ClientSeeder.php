<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $clients = [
            [
                'company_name' => 'TechnoMaroc SARL',
                'contact_name' => 'Ahmed Benali',
                'email' => 'contact@technomaroc.ma',
                'phone' => '+212 5 22 34 56 78',
                'address' => '123 Boulevard Mohammed V',
                'city' => 'Casablanca',
                'postal_code' => '20000',
                'country' => 'Maroc',
                'ice' => '001234567890123',
                'rc' => 'RC123456',
                'patente' => 'PAT789012',
                'cnss' => 'CNSS345678',
                'if_number' => 'IF901234',
                'tax_regime' => 'normal',
                'is_tva_subject' => true,
                'is_active' => true,
            ],
            [
                'company_name' => 'Digital Solutions',
                'contact_name' => 'Fatima Zahra',
                'email' => 'fz@digitalsolutions.ma',
                'phone' => '+212 6 12 34 56 78',
                'address' => '456 Avenue Hassan II',
                'city' => 'Rabat',
                'postal_code' => '10000',
                'country' => 'Maroc',
                'ice' => '001234567890124',
                'rc' => 'RC123457',
                'patente' => 'PAT789013',
                'tax_regime' => 'normal',
                'is_tva_subject' => true,
                'is_active' => true,
            ],
            [
                'company_name' => 'StartupTech',
                'contact_name' => 'Youssef Alami',
                'email' => 'y.alami@startuptech.ma',
                'phone' => '+212 7 98 76 54 32',
                'address' => '789 Rue de la Liberté',
                'city' => 'Marrakech',
                'postal_code' => '40000',
                'country' => 'Maroc',
                'ice' => '001234567890125',
                'tax_regime' => 'auto_entrepreneur',
                'is_tva_subject' => false,
                'is_active' => true,
            ],
        ];

        foreach ($clients as $clientData) {
            Client::create($clientData);
        }
    }
}
