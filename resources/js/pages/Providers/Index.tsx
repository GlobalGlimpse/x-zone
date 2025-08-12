import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { PageProps } from '@/types'

interface Provider {
    id: number
    name: string
    email: string | null
    phone: string | null
    address: string | null
    contact_person: string | null
    is_active: boolean
    deleted_at: string | null
    created_at: string
    updated_at: string
}

interface Props extends PageProps {
    providers: {
        data: Provider[]
        current_page: number
        per_page: number
        total: number
        last_page: number
        links: Array<{ url: string | null; label: string; active: boolean }>
    }
    filters: {
        search?: string
        status?: string
    }
}

export default function Index({ providers, filters }: Props) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '')
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '')

    const handleSearch = () => {
        router.get(route('providers.index'), {
            search: searchTerm,
            status: selectedStatus,
        }, {
            preserveState: true,
            replace: true,
        })
    }

    const handleRestore = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir restaurer ce fournisseur ?')) {
            router.post(route('providers.restore', id))
        }
    }

    const handleDelete = (id: number) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
            router.delete(route('providers.destroy', id))
        }
    }

    return (
        <>
            <Head title="Fournisseurs" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Fournisseurs</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Gérez vos fournisseurs et leurs informations de contact
                        </p>
                    </div>
                    <Link
                        href={route('providers.create')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        ➕ Nouveau fournisseur
                    </Link>
                </div>

                {/* Filtres */}
                <div className="bg-white shadow rounded-lg p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Recherche
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Nom, email, contact..."
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Statut
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            >
                                <option value="">Tous les statuts</option>
                                <option value="active">Actif</option>
                                <option value="inactive">Inactif</option>
                            </select>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-end space-x-3">
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setSelectedStatus('')
                                router.get(route('providers.index'))
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            Réinitialiser
                        </button>
                        <button
                            onClick={handleSearch}
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Filtrer
                        </button>
                    </div>
                </div>

                {/* Tableau */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Fournisseur
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Adresse
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Statut
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Date création
                                </th>
                                <th className="relative px-6 py-3">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {providers.data.map((provider) => (
                                <tr key={provider.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">
                                                {provider.name}
                                            </div>
                                            {provider.contact_person && (
                                                <div className="text-sm text-gray-500">
                                                    Contact: {provider.contact_person}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {provider.email && (
                                                <div>📧 {provider.email}</div>
                                            )}
                                            {provider.phone && (
                                                <div>📞 {provider.phone}</div>
                                            )}
                                            {!provider.email && !provider.phone && (
                                                <span className="text-gray-400">Non renseigné</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                                        {provider.address || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                provider.deleted_at
                                                    ? 'bg-red-100 text-red-800'
                                                    : provider.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {provider.deleted_at
                                                    ? 'Supprimé'
                                                    : provider.is_active
                                                        ? 'Actif'
                                                        : 'Inactif'
                                                }
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {new Date(provider.created_at).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {provider.deleted_at ? (
                                            <button
                                                onClick={() => handleRestore(provider.id)}
                                                className="text-green-600 hover:text-green-900 mr-3"
                                            >
                                                Restaurer
                                            </button>
                                        ) : (
                                            <>
                                                <Link
                                                    href={route('providers.show', provider.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Voir
                                                </Link>
                                                <Link
                                                    href={route('providers.edit', provider.id)}
                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                >
                                                    Modifier
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(provider.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Supprimer
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {providers.data.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-gray-500">
                                <div className="text-4xl mb-4">🏢</div>
                                <h3 className="text-lg font-medium">Aucun fournisseur</h3>
                                <p className="mt-1">Commencez par créer votre premier fournisseur.</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {providers.last_page > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                        <div className="flex-1 flex justify-between sm:hidden">
                            {providers.links[0].url && (
                                <Link
                                    href={providers.links[0].url}
                                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Précédent
                                </Link>
                            )}
                            {providers.links[providers.links.length - 1].url && (
                                <Link
                                    href={providers.links[providers.links.length - 1].url}
                                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                >
                                    Suivant
                                </Link>
                            )}
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Affichage de{' '}
                                    <span className="font-medium">
                                        {(providers.current_page - 1) * providers.per_page + 1}
                                    </span>{' '}
                                    à{' '}
                                    <span className="font-medium">
                                        {Math.min(providers.current_page * providers.per_page, providers.total)}
                                    </span>{' '}
                                    sur{' '}
                                    <span className="font-medium">{providers.total}</span> résultats
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {providers.links.map((link, index) => (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                                link.active
                                                    ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                            } ${
                                                index === 0 ? 'rounded-l-md' : ''
                                            } ${
                                                index === providers.links.length - 1 ? 'rounded-r-md' : ''
                                            }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}
