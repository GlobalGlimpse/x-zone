import React from 'react'

export interface LaptopData {
  cpu?: string
  ram?: number
  graphic_card?: string
  keyboard?: string
  condition?: 'new' | 'used' | 'refurbished'
  storage?: number
  storage_type?: 'SSD' | 'HDD'
  screen_size?: number
  weight?: number
}

export default function LaptopFields({
  data, setData, errors = {}
}: {
  data: LaptopData
  setData: <K extends keyof LaptopData>(field: K, value: LaptopData[K]) => void
  errors?: Partial<Record<keyof LaptopData, string>>
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
          <div className="w-3 h-2 border border-white rounded-sm"></div>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Spécifications Ordinateur Portable
        </h3>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm
                      dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* CPU */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              CPU
            </label>
            <input
              type="text"
              value={data.cpu ?? ''}
              onChange={e => setData('cpu', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              maxLength={100}
            />
            {errors.cpu && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.cpu}</div>
            )}
          </div>

          {/* RAM */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              RAM (Go)
            </label>
            <input
              type="number"
              value={data.ram ?? ''}
              onChange={e => {
                const value = parseInt(e.target.value)
                setData('ram', isNaN(value) ? undefined : value)
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              min={1}
              max={128}
              step={1}
            />
            {errors.ram && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.ram}</div>
            )}
          </div>

          {/* Carte graphique */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Carte graphique
            </label>
            <input
              type="text"
              value={data.graphic_card ?? ''}
              onChange={e => setData('graphic_card', e.target.value || undefined)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              maxLength={100}
            />
            {errors.graphic_card && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.graphic_card}</div>
            )}
          </div>

          {/* Clavier */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Clavier
            </label>
            <select
              value={data.keyboard ?? ''}
              onChange={e =>
                setData('keyboard', e.target.value === '' ? undefined : (e.target.value as 'AZERTY' | 'QWERTY'))
              }
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="" className="text-slate-500">
                Sélectionnez un clavier...
              </option>
              <option value="AZERTY">AZERTY</option>
              <option value="QWERTY">QWERTY</option>
            </select>
            {errors.keyboard && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.keyboard}</div>
            )}
          </div>

          {/* Stockage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Stockage (Go)
            </label>
            <input
              type="number"
              value={data.storage ?? ''}
              onChange={e => {
                const value = parseInt(e.target.value)
                setData('storage', isNaN(value) ? undefined : value)
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              min={64}
              max={4096}
              step={64}
            />
            {errors.storage && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.storage}</div>
            )}
          </div>

          {/* Type de stockage */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Type de stockage
            </label>
            <select
              value={data.storage_type ?? ''}
              onChange={e =>
                setData('storage_type', e.target.value === '' ? undefined : (e.target.value as 'SSD' | 'HDD'))
              }
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="" className="text-slate-500">
                Sélectionnez un type de stockage...
              </option>
              <option value="SSD">SSD</option>
              <option value="HDD">HDD</option>
            </select>
            {errors.storage_type && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.storage_type}</div>
            )}
          </div>

          {/* Taille écran */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Taille écran (pouces)
            </label>
            <select
              value={data.screen_size ?? ''}
              onChange={e => {
                const value = parseFloat(e.target.value)
                setData('screen_size', isNaN(value) ? undefined : value)
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="" className="text-slate-500">
                Sélectionnez une taille d'écran...
              </option>
              {[11.6, 12.5, 13.3, 14.0, 15.0, 15.6, 16.0, 17.3].map(size => (
                <option key={size} value={size}>{size.toFixed(1)} pouces</option>
              ))}
            </select>
            {errors.screen_size && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.screen_size}</div>
            )}
          </div>

          {/* Poids */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Poids (kg)
            </label>
            <input
              type="number"
              value={data.weight ?? ''}
              onChange={e => {
                const value = parseFloat(e.target.value)
                setData('weight', isNaN(value) ? undefined : value)
              }}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              min={0.5}
              max={5}
              step={0.01}
              placeholder="Ex : 1.35"
            />
            {errors.weight && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.weight}</div>
            )}
          </div>

          {/* État */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              État
            </label>
            <select
              value={data.condition ?? ''}
              onChange={e =>
                setData('condition', e.target.value === '' ? undefined : (e.target.value as 'new' | 'used' | 'refurbished'))
              }
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="" className="text-slate-500">
                Sélectionnez un état...
              </option>
              <option value="new">Neuf</option>
              <option value="used">Occasion</option>
              <option value="refurbished">Reconditionné</option>
            </select>
            {errors.condition && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.condition}</div>
            )}
          </div>
        </div>

        {/* Info section */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Conseils pour les ordinateurs portables :</p>
            <ul className="space-y-1 text-xs">
              <li>• Vérifiez l'autonomie de la batterie selon l'usage</li>
              <li>• Le poids est important pour la mobilité</li>
              <li>• SSD recommandé pour de meilleures performances</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
