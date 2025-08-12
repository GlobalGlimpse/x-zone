import React from 'react'

export interface PsuData {
  power: number
  efficiency_rating: string
  modular: boolean        // ← booléen
  form_factor: string
  connector_types?: string
  protection_features?: string
}

interface Props {
  data: PsuData
  setData: <K extends keyof PsuData>(f: K, v: PsuData[K]) => void
  errors?: Partial<Record<keyof PsuData, string>>
}

const PsuFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
        <div className="w-3 h-1 bg-white rounded-full"></div>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        Spécifications Alimentation
      </h3>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white shadow-sm
                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Puissance */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Puissance (W) <span className="text-red-500">*</span>
          </label>
          <input
            type="number" min={1}
            value={data.power}
            onChange={e => setData('power', Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.power && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.power}</div>
          )}
        </div>

        {/* Rendement 80+ */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Rendement 80+ <span className="text-red-500">*</span>
          </label>
          <input
            value={data.efficiency_rating}
            onChange={e => setData('efficiency_rating', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.efficiency_rating && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.efficiency_rating}</div>
          )}
        </div>

        {/* Format */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Form-factor <span className="text-red-500">*</span>
          </label>
          <input
            value={data.form_factor}
            onChange={e => setData('form_factor', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.form_factor && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.form_factor}</div>
          )}
        </div>

        {/* Modulaire */}
        <div className="flex items-center">
          <input
            id="psu_modular"
            type="checkbox"
            checked={data.modular}
            onChange={e => setData('modular', e.target.checked)}
            className="h-4 w-4 text-red-600 border-slate-300 dark:border-slate-600 rounded focus:ring-red-500"
          />
          <label htmlFor="psu_modular" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
            Câbles modulaires
          </label>
          {errors.modular && (
            <div className="text-xs text-red-600 dark:text-red-400 ml-2">{errors.modular}</div>
          )}
        </div>

        {/* Connecteurs & protections (ligne entière) */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Types de connecteurs
          </label>
          <input
            value={data.connector_types ?? ''}
            onChange={e => setData('connector_types', e.target.value || undefined)}
            placeholder="Ex. 2×CPU 8 pin · 3×PCI-E 8 pin"
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.connector_types && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.connector_types}</div>
          )}
        </div>

        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Protections (OVP, OCP…)
          </label>
          <input
            value={data.protection_features ?? ''}
            onChange={e => setData('protection_features', e.target.value || undefined)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.protection_features && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.protection_features}</div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Conseils pour les alimentations :</p>
          <ul className="space-y-1 text-xs">
            <li>• Calculez la puissance nécessaire avec une marge de sécurité</li>
            <li>• Une certification 80+ garantit une meilleure efficacité</li>
            <li>• Les câbles modulaires facilitent la gestion des câbles</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)

export default PsuFields
// }
