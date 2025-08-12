<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Liste complète des permissions
        $permissions = [
            // Utilisateurs
            'users-management',
            'user-list',
            'user-create',
            'user-edit',
            'user-delete',

            // Rôles
            'role-list',
            'role-create',
            'role-edit',
            'role-delete',

            // Permissions
            'permission-list',
            'permission-create',
            'permission-edit',
            'permission-delete',

            // Logs de connexion
            'login-logs-list',

            // Catégories
            'category_list',
            'category_create',
            'category_show',
            'category_edit',
            'category_delete',
            'category_restore',

            // Produits
            'product_list',
            'product_create',
            'product_show',
            'product_edit',
            'product_delete',
            'product_restore',

            // Logs d'audit
            'audit-log-list',
            'audit-log-export',

            // Export logs de connexion
            'login-log-export',

            // Currency
            'currency_list',
            'currency_create',
            'currency_show',
            'currency_edit',
            'currency_delete',
            'currency_restore',

            // Taxrate
            'taxrate_list',
            'taxrate_create',
            'taxrate_show',
            'taxrate_edit',
            'taxrate_delete',
            'taxrate_restore',

            // ← Nouvelles permissions pour le stock
            'stock_list',
            'stock_create',
            'stock_edit',
            'stock_delete',
            'stock_restore',

        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Création des rôles
        $superAdmin = Role::firstOrCreate(['name' => 'SuperAdmin', 'guard_name' => 'web']);
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'web']);
        $user = Role::firstOrCreate(['name' => 'User', 'guard_name' => 'web']);

        // SuperAdmin a toutes les permissions
        $superAdmin->syncPermissions(Permission::all());

        // Admin a un sous-ensemble de permissions
        $admin->syncPermissions([
            'users-management',
            'user-list',
            'user-create',
            'user-edit',
            'user-delete',
            'category_list',
            'category_create',
            'category_edit',
            'category_delete',
            'product_list',
            'product_create',
            'product_edit',
            'product_delete',
            'stock_list',        // ← Ajout des permissions stock
            'stock_create',
            'stock_edit',
            'stock_delete',
        ]);
    }
}
