import { Head, Link, router } from '@inertiajs/react'
import { PageProps } from '@/types'

interface Provider {
    id: number
    name: string
    email: string | null
    phone: string | null
    address: string | null
    contact_person: string | null
    is_active: boolean
    created_at: string
    updated_at: string
    stock_movements?: Array<{
        id: number
        type: string
        quantity: number
        movement_date: string
        product: {
            name: string
            sku: string
        }
    }>
}

interface Props extends PageProps {
    provider: Provider
}

export default function Show({ provider }: Props) {
    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) {
            router.delete(route('providers.destroy', provider.id))
        }
    }

    return (
        <>
            <Head title={provider.name} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">{provider.name}</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            Détails du fournisseur
                        </p>
                    </div>
                    <div className="flex space-x-3">
                        <Link
                            href={route('providers.edit', provider.id)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            ✏️ Modifier
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                            🗑️ Supprimer
                        </button>
                        <Link
                            href={route('providers.index')}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                            ← Retour à la liste
                        </Link>
                    </div>
                </div>

                {/* Informations principales */}
                <div className="bg-white shadow rounded-lg">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
                    </div>
                    <div className="px-6 py-4">
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Nom du fournisseur</dt>
                                <dd className="mt-1 text-sm text-gray-900">{provider.name}</dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Statut</dt>
                                <dd className="mt-1">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        provider.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {provider.is_active ? 'Actif' : 'Inactif'}
                                    </span>
                                </dd>
                            </div>

                            {provider.contact_person && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Personne de contact</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{provider.contact_person}</dd>
                                </div>
                            )}

                            {provider.email && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <a href={`mailto:${provider.email}`} className="text-indigo-600 hover:text-indigo-900">
                                            {provider.email}
                                        </a>
                                    </dd>
                                </div>
                            )}

                            {provider.phone && (
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Téléphone</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <a href={`tel:${provider.phone}`} className="text-indigo-600 hover:text-indigo-900">
                                            {provider.phone}
                                        </a>
                                    </dd>
                                </div>
                            )}

                            {provider.address && (
                                <div className="md:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Adresse</dt>
                                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{provider.address}</dd>
                                </div>
                            )}

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Date de création</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(provider.created_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </dd>
                            </div>

                            <div>
                                <dt className="text-sm font-medium text-gray-500">Dernière modification</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {new Date(provider.updated_at).toLocaleDateString('fr-FR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Mouvements de stock récents */}
                {provider.stock_movements && provider.stock_movements.length > 0 && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Mouvements de stock récents</h3>
                        </div>
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Produit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Quantité
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {provider.stock_movements.slice(0, 5).map((movement) => (
                                        <tr key={movement.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(movement.movement_date).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {movement.product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {movement.product.sku}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                    movement.type === 'in' ? 'bg-green-100 text-green-800' :
                                                    movement.type === 'out' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {movement.type === 'in' ? 'Entrée' :
                                                     movement.type === 'out' ? 'Sortie' : 'Ajustement'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <span className={movement.quantity >= 0 ? 'text-green-600' : 'text-red-600'}>
                                                    {movement.quantity >= 0 ? '+' : ''}{movement.quantity}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {provider.stock_movements.length > 5 && (
                            <div className="px-6 py-3 bg-gray-50 text-center">
                                <Link
                                    href={route('stock-movements.index', { provider_id: provider.id })}
                                    className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                                >
                                    Voir tous les mouvements ({provider.stock_movements.length})
                                </Link>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    )
}
