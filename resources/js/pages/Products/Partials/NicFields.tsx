import React from 'react'

/* ---------- Typage aligné sur la table network_cards -------------- */
export interface NicData {
  interface:       string   // PCIe…
  speed:           number   // Gbps
  ports:           number
  connector_type:  string   // RJ-45, SFP+
  chipset?:        string   // facultatif
}

interface Props {
  data:    NicData
  setData: <K extends keyof NicData>(f: K, v: NicData[K]) => void
  errors?: Partial<Record<keyof NicData,string>>
}

const NicFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
        <div className="w-2 h-2 bg-white rounded-full"></div>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        Spécifications Carte Réseau
      </h3>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white shadow-sm
                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          ['Interface',      'interface',      'text'  ],
          ['Débit (Gbps)',   'speed',          'number', 1],
          ['Nombre ports',   'ports',          'number', 1],
          ['Connecteur',     'connector_type', 'text'  ],
          ['Chipset',        'chipset',        'text'  ],
        ].map(([label, key, type, step]) => (
          <div key={key as string}>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              {label}
            </label>
            <input
              type={type as string}
              step={step as number | undefined}
              min={type === 'number' ? 0 : undefined}
              value={(data as any)[key as string] ?? ''}
              onChange={e => setData(
                key as keyof NicData,
                type === 'number' ? Number(e.target.value) : e.target.value,
              )}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            {errors[key as keyof NicData] && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors[key as keyof NicData]}</div>
            )}
          </div>
        ))}
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Conseils pour les cartes réseau :</p>
          <ul className="space-y-1 text-xs">
            <li>• Vérifiez la compatibilité avec votre slot PCIe</li>
            <li>• Le débit dépend de votre infrastructure réseau</li>
            <li>• SFP+ permet l'utilisation de modules optiques</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)

export default NicFields
