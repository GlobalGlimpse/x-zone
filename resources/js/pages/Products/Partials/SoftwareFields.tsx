import React from 'react'

export interface SoftwareData {
  name: string
  version?: string
  os_support?: string
  type: string
  license_included: boolean
  download_link?: string
  activation_instructions?: string
}

interface Props {
  data: SoftwareData
  setData: (field: keyof SoftwareData, value: any) => void
  errors?: Partial<Record<keyof SoftwareData, string>>
}

const SoftwareFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
        <div className="w-2 h-3 bg-white rounded-sm"></div>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        Spécifications Logiciel
      </h3>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white shadow-sm
                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ['Nom',                  'name',                   'text'],
          ['Version',              'version',                'text'],
          ['OS supportés',         'os_support',             'text'],
          ['Type',                 'type',                   'text'],
        ].map(([label, key, type]) => (
          <div key={key as string} className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {label} {key === 'name' || key === 'type' ? <span className="text-red-500">*</span> : ''}
            </label>
            <input
              type={type}
              value={(data as any)[key as string] ?? ''}
              onChange={e => setData(key as keyof SoftwareData, e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            {errors[key as keyof SoftwareData] && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors[key as keyof SoftwareData]}</div>
            )}
          </div>
        ))}

        {/* Lien de téléchargement avec préfixe */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Lien de téléchargement
          </label>
          <div className="flex w-full">
            <span className="inline-flex items-center px-3 rounded-l border border-r-0 border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm">
              https://
            </span>
            <input
              type="text"
              value={(data.download_link ?? '').replace(/^https?:\/\//, '')}
              onChange={e => setData('download_link', 'https://' + e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-r focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
          </div>
          {errors.download_link && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.download_link}</div>
          )}
        </div>

        {/* Instructions d'activation */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Instructions d'activation
          </label>
          <textarea
            value={data.activation_instructions ?? ''}
            onChange={e => setData('activation_instructions', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            rows={4}
          />
          {errors.activation_instructions && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.activation_instructions}</div>
          )}
        </div>

        {/* Licence incluse */}
        <div className="col-span-1 md:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            checked={data.license_included}
            onChange={e => setData('license_included', e.target.checked)}
            className="h-4 w-4 text-red-600 border-slate-300 dark:border-slate-600 rounded focus:ring-red-500"
          />
          <label className="text-sm text-slate-700 dark:text-slate-300">
            Licence incluse
          </label>
          {errors.license_included && (
            <div className="text-xs text-red-600 dark:text-red-400 ml-2">{errors.license_included}</div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Conseils pour les logiciels :</p>
          <ul className="space-y-1 text-xs">
            <li>• Vérifiez la compatibilité avec votre système d'exploitation</li>
            <li>• Assurez-vous d'avoir les droits de redistribution</li>
            <li>• Fournissez des instructions claires pour l'activation</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)

export default SoftwareFields
