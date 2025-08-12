import React, { useMemo, useState } from 'react'
import { Head, Link } from '@inertiajs/react'
import { route } from 'ziggy-js'
import {
  ArrowLeft, Package2, Download, Search, Filter,
  TrendingUp, TrendingDown, Equal, BarChart3,
  Eye, AlertTriangle, CheckCircle, XCircle,
  Grid3X3, List, Calendar, Users, Activity,
  RefreshCw, Package
} from 'lucide-react'

import AppLayout from '@/layouts/app-layout'
import ParticlesBackground from '@/components/ParticlesBackground'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PageProps, Product } from '@/types'

/* ------------------------------------------------------------------ */
/* Types & props                                                      */
/* ------------------------------------------------------------------ */
interface ReportProduct extends Product {
  total_in: number
  total_out: number
  total_adjustments: number
  category?: { id: number; name: string }
}

interface GlobalStats {
  total_products: number
  total_stock: number
  low_stock_count: number
  out_of_stock_count: number
  total_in: number
  total_out: number
  total_adjustments: number
}

interface Props extends PageProps<{
  products: ReportProduct[]
  globalStats: GlobalStats
}> {}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function StockReport({ products, globalStats }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out' | 'good'>('all')
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const [sortBy, setSortBy] = useState<'name' | 'stock' | 'in' | 'out'>('name')

  /* -------------------------------------------------------------- */
  /* Helpers                                                       */
  /* -------------------------------------------------------------- */
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { status: 'out', color: 'text-red-500', bgColor: 'bg-red-500', icon: XCircle }
    if (quantity < 10) return { status: 'low', color: 'text-yellow-500', bgColor: 'bg-yellow-500', icon: AlertTriangle }
    return { status: 'good', color: 'text-green-500', bgColor: 'bg-green-500', icon: CheckCircle }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num)
  }

  /* -------------------------------------------------------------- */
  /* Filtrage et tri                                               */
  /* -------------------------------------------------------------- */
  const categories = useMemo(() => {
    const cats = products.map(p => p.category?.name).filter(Boolean)
    return [...new Set(cats)]
  }, [products])

  const filteredProducts = useMemo(() => {
    let filtered = [...products]

    // Recherche
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Catégorie
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category?.name === selectedCategory)
    }

    // Filtre par statut de stock
    if (stockFilter !== 'all') {
      filtered = filtered.filter(p => {
        const status = getStockStatus(p.stock_quantity).status
        return status === stockFilter
      })
    }
    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stock':
          return b.stock_quantity - a.stock_quantity
        case 'in':
          return b.total_in - a.total_in
        case 'out':
          return b.total_out - a.total_out
        default:
          return a.name.localeCompare(b.name)
      }
    })

    return filtered
  }, [products, searchTerm, selectedCategory, stockFilter, sortBy])

  /* -------------------------------------------------------------- */
  /* Render                                                        */
  /* -------------------------------------------------------------- */
  return (
    <>
      <Head title="Rapport des mouvements de stock" />

      <div className="min-h-screen bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749] transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout
          breadcrumbs={[
            { title: 'Dashboard', href: '/dashboard' },
            { title: 'Mouvements', href: '/stock-movements' },
            { title: 'Rapport', href: route('stock-movements.report') },
          ]}
        >
          <div className="p-6 space-y-6">
            {/* -------- En-tête avec actions -------- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  Rapport des mouvements de stock
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2">
                  Vue d'ensemble complète des mouvements et niveaux de stock
                </p>
              </div>
              <div className="flex gap-3">
                <Link href={route('stock-movements.index')}>
                  <Button variant="outline" size="sm" className="bg-white/50 dark:bg-white/5 backdrop-blur-sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </Link>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-600 shadow-lg"
                  onClick={() => window.location.href = route('stock-movements.export')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </div>

            {/* -------- Métriques principales -------- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Produits totaux"
                value={globalStats.total_products}
                icon={Package2}
                color="from-blue-600 to-blue-500"
                trend="+5%"
                onClick={() => setStockFilter('all')}
                isActive={stockFilter === 'all'}
              />
              <MetricCard
                title="Stock actuel"
                value={globalStats.total_stock}
                icon={Activity}
                color="from-green-600 to-green-500"
                trend="+12%"
                onClick={() => setStockFilter('good')}
                isActive={stockFilter === 'good'}
              />
              <MetricCard
                title="Stock faible"
                value={globalStats.low_stock_count}
                icon={AlertTriangle}
                color="from-yellow-600 to-yellow-500"
                trend="-3%"
                onClick={() => setStockFilter('low')}
                isActive={stockFilter === 'low'}
              />
              <MetricCard
                title="Ruptures"
                value={globalStats.out_of_stock_count}
                icon={XCircle}
                color="from-red-600 to-red-500"
                trend="-8%"
                onClick={() => setStockFilter('out')}
                isActive={stockFilter === 'out'}
              />
            </div>

            {/* -------- Résumé des mouvements -------- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <MovementCard
                title="Entrées totales"
                value={globalStats.total_in}
                icon={TrendingUp}
                color="text-green-600"
                bgColor="from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20"
                description="Unités reçues"
                prefix="+"
              />
              <MovementCard
                title="Sorties totales"
                value={globalStats.total_out}
                icon={TrendingDown}
                color="text-red-600"
                bgColor="from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20"
                description="Unités sorties"
                prefix="-"
              />
              <MovementCard
                title="Ajustements"
                value={globalStats.total_adjustments}
                icon={Equal}
                color="text-blue-600"
                bgColor="from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20"
                description="Corrections appliquées"
                prefix={globalStats.total_adjustments >= 0 ? "+" : ""}
              />
            </div>

            {/* -------- Filtres et contrôles -------- */}
            <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <Input
                        placeholder="Rechercher un produit..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-white/50 dark:bg-white/5 border-slate-200 dark:border-slate-700"
                      />
                    </div>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48 bg-white/50 dark:bg-white/5 border-slate-200 dark:border-slate-700">
                        <SelectValue placeholder="Toutes catégories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes catégories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                      <SelectTrigger className="w-48 bg-white/50 dark:bg-white/5 border-slate-200 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nom A-Z</SelectItem>
                        <SelectItem value="stock">Stock (élevé)</SelectItem>
                        <SelectItem value="in">Entrées (élevé)</SelectItem>
                        <SelectItem value="out">Sorties (élevé)</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={stockFilter} onValueChange={(value: any) => setStockFilter(value)}>
                      <SelectTrigger className="w-48 bg-white/50 dark:bg-white/5 border-slate-200 dark:border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les stocks</SelectItem>
                        <SelectItem value="good">Stock normal</SelectItem>
                        <SelectItem value="low">Stock faible</SelectItem>
                        <SelectItem value="out">Ruptures</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className={viewMode === 'table' ? 'bg-gradient-to-r from-blue-600 to-blue-500' : ''}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'cards' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('cards')}
                      className={viewMode === 'cards' ? 'bg-gradient-to-r from-blue-600 to-blue-500' : ''}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* -------- Affichage des données -------- */}
            {viewMode === 'table' ? (
              <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm">
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Produit</th>
                        <th className="text-left p-4 font-semibold text-slate-700 dark:text-slate-300">Catégorie</th>
                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300">Stock</th>
                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300">Entrées</th>
                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300">Sorties</th>
                        <th className="text-right p-4 font-semibold text-slate-700 dark:text-slate-300">Ajustements</th>
                        <th className="text-center p-4 font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map(product => {
                        const stockStatus = getStockStatus(product.stock_quantity)
                        const StatusIcon = stockStatus.icon

                        return (
                          <tr key={product.id} className="border-b border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all duration-200">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-lg flex items-center justify-center shadow-sm">
                                  <Package2 className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                </div>
                                <div>
                                  <div className="font-semibold text-slate-900 dark:text-white">{product.name}</div>
                                  {product.sku && (
                                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{product.sku}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              {product.category?.name ? (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium">
                                  {product.category.name}
                                </Badge>
                              ) : (
                                <span className="text-slate-400">—</span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <StatusIcon className={`w-4 h-4 ${stockStatus.color}`} />
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {formatNumber(product.stock_quantity)}
                                </span>
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <span className="text-green-600 font-semibold">+{formatNumber(product.total_in)}</span>
                            </td>
                            <td className="p-4 text-right">
                              <span className="text-red-600 font-semibold">-{formatNumber(product.total_out)}</span>
                            </td>
                            <td className="p-4 text-right">
                              <span className={`font-semibold ${product.total_adjustments >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                                {product.total_adjustments > 0 ? '+' : ''}{formatNumber(product.total_adjustments)}
                              </span>
                            </td>
                            <td className="p-4 text-center">
                              <Link href={`/products/${product.id}`}>
                                <Button variant="ghost" size="sm" className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                                  <Eye className="w-4 h-4 text-blue-600" />
                                </Button>
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => {
                  const stockStatus = getStockStatus(product.stock_quantity)
                  const StatusIcon = stockStatus.icon

                  return (
                    <Card key={product.id} className="bg-white/60 dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                              <Package2 className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                            </div>
                            <div>
                              <CardTitle className="text-base text-slate-900 dark:text-white leading-tight">{product.name}</CardTitle>
                              {product.sku && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{product.sku}</p>
                              )}
                            </div>
                          </div>
                          {product.category?.name && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                              {product.category.name}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg">
                          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Stock actuel</span>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-4 h-4 ${stockStatus.color}`} />
                            <span className="font-bold text-slate-900 dark:text-white">{formatNumber(product.stock_quantity)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 bg-green-50/50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-lg font-bold text-green-600">+{formatNumber(product.total_in)}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Entrées</div>
                          </div>
                          <div className="text-center p-3 bg-red-50/50 dark:bg-red-900/20 rounded-lg">
                            <div className="text-lg font-bold text-red-600">-{formatNumber(product.total_out)}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sorties</div>
                          </div>
                          <div className="text-center p-3 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg">
                            <div className={`text-lg font-bold ${product.total_adjustments >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                              {product.total_adjustments > 0 ? '+' : ''}{formatNumber(product.total_adjustments)}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ajust.</div>
                          </div>
                        </div>

                        <Link href={`/products/${product.id}`}>
                          <Button variant="outline" size="sm" className="w-full mt-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300">
                            <Eye className="w-4 h-4 mr-2" />
                            Voir détails
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl">
                <CardContent className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package2 className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    {stockFilter === 'low' ? 'Aucun produit en stock faible' :
                     stockFilter === 'out' ? 'Aucune rupture de stock' :
                     stockFilter === 'good' ? 'Aucun produit avec stock normal' :
                     'Aucun produit trouvé'}
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    {stockFilter !== 'all' ?
                      'Cliquez sur "Tous les stocks" pour voir tous les produits.' :
                      'Essayez de modifier vos critères de recherche ou de filtrage.'}
                  </p>
                  {stockFilter !== 'all' && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setStockFilter('all')}
                    >
                      Voir tous les produits
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </AppLayout>
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* UI helpers                                                         */
/* ------------------------------------------------------------------ */
interface MetricCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  trend?: string
  onClick?: () => void
  isActive?: boolean
}

const MetricCard = ({ title, value, icon: Icon, color, trend, onClick, isActive }: MetricCardProps) => (
  <Card
    className={`bg-white/60 dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
      isActive ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent' : ''
    }`}
    onClick={onClick}
  >
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
            {new Intl.NumberFormat('fr-FR').format(value)}
          </p>
          {trend && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend} vs mois dernier
            </p>
          )}
          {isActive && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
              Filtre actif
            </p>
          )}
        </div>
        <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${color} flex items-center justify-center shadow-lg`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>
    </CardContent>
  </Card>
)

interface MovementCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
  description: string
  prefix: string
}

const MovementCard = ({ title, value, icon: Icon, color, bgColor, description, prefix }: MovementCardProps) => (
  <Card className="bg-white/60 dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className={`text-3xl font-bold ${color} mb-1`}>
        {prefix}{new Intl.NumberFormat('fr-FR').format(value)}
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </CardContent>
  </Card>
)
