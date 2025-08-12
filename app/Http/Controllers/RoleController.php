<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Role;
use App\Models\Permission;

class RoleController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $isSuperAdmin = $user->hasRole('SuperAdmin');

        $rolesQuery = Role::with('permissions');

        if ($isSuperAdmin) {
            $rolesQuery->withTrashed();
        }

        $roles = $rolesQuery->get();
        $permissions = Permission::all();

        return Inertia::render('Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
            'isSuperAdmin' => $isSuperAdmin
        ]);
    }

    public function create()
    {
        $permissions = Permission::all();

        return Inertia::render('Roles/Create', [
            'permissions' => $permissions
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name',
            'permissions' => 'required|array'
        ]);

        $role = Role::create(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('roles.index')->with('success', 'Rôle créé avec succès.');
    }

    public function show($id)
    {
        $role = Role::withTrashed()->with('permissions')->findOrFail($id);

        return Inertia::render('Roles/Show', [
            'role' => $role,
            'rolePermissions' => $role->permissions->pluck('name')
        ]);
    }

    public function edit(Role $role)
    {
        $permissions = Permission::all();

        return Inertia::render('Roles/Edit', [
            'role' => $role,
            'permissions' => $permissions,
            'rolePermissions' => $role->permissions->pluck('name')
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:roles,name,' . $role->id,
            'permissions' => 'required|array'
        ]);

        $role->update(['name' => $validated['name']]);
        $role->syncPermissions($validated['permissions']);

        return redirect()->route('roles.index')->with('success', 'Rôle mis à jour avec succès.');
    }

    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        if($role->name === 'SuperAdmin') {
            return redirect()->route('roles.index')->with('error', 'Le rôle SuperAdmin ne peut pas être supprimé.');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Rôle supprimé avec succès.');
    }

    public function restore($id)
    {
        $role = Role::withTrashed()->findOrFail($id);
        $role->restore();

        return redirect()->route('roles.index')->with('success', 'Rôle restauré avec succès.');
    }
}
