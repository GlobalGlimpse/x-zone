import React from 'react'

/* ---------- Typage aligné sur la table `graphic_cards` --------------- */
export interface GraphicCardData {
  gpu_chipset:        string
  vram:               number            // GB
  memory_type:        string            // GDDR6…
  core_clock:         number            // MHz
  boost_clock?:       number | null     // MHz
  power_consumption?: number | null     // W
  ports?:             string | null     // ex: "3×DP / 1×HDMI"
}

interface Props {
  data:    GraphicCardData
  setData: <K extends keyof GraphicCardData>(f: K, v: GraphicCardData[K]) => void
  errors?: Partial<Record<keyof GraphicCardData, string>>
}

const GraphicCardFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
        <div className="w-3 h-3 border border-white rounded-sm"></div>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        Spécifications Carte Graphique
      </h3>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white shadow-sm
                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/** GPU / Chipset */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            GPU / Chipset <span className="text-red-500">*</span>
          </label>
          <input
            value={data.gpu_chipset}
            onChange={e => setData('gpu_chipset', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.gpu_chipset && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.gpu_chipset}</div>
          )}
        </div>

        {/** VRAM */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            VRAM (GB) <span className="text-red-500">*</span>
          </label>
          <input
            type="number" min={1}
            value={data.vram}
            onChange={e => setData('vram', Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.vram && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.vram}</div>
          )}
        </div>

        {/** Type mémoire */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Type mémoire <span className="text-red-500">*</span>
          </label>
          <input
            value={data.memory_type}
            onChange={e => setData('memory_type', e.target.value)}
            placeholder="GDDR6"
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.memory_type && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.memory_type}</div>
          )}
        </div>

        {/** Core clock */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Core clock (MHz) <span className="text-red-500">*</span>
          </label>
          <input
            type="number" min={1}
            value={data.core_clock}
            onChange={e => setData('core_clock', Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.core_clock && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.core_clock}</div>
          )}
        </div>

        {/** Boost clock */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Boost clock (MHz)
          </label>
          <input
            type="number" min={0}
            value={data.boost_clock ?? ''}
            onChange={e =>
              setData('boost_clock', e.target.value === '' ? null : Number(e.target.value))
            }
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.boost_clock && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.boost_clock}</div>
          )}
        </div>

        {/** Conso W */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Consommation (W)
          </label>
          <input
            type="number" min={0}
            value={data.power_consumption ?? ''}
            onChange={e =>
              setData('power_consumption', e.target.value === '' ? null : Number(e.target.value))
            }
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.power_consumption && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.power_consumption}</div>
          )}
        </div>

        {/** Ports – ligne complète */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Ports vidéo
          </label>
          <input
            value={data.ports ?? ''}
            onChange={e => setData('ports', e.target.value || null)}
            placeholder="Ex. 3×DP 1.4 / 1×HDMI 2.1"
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.ports && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.ports}</div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Conseils pour les cartes graphiques :</p>
          <ul className="space-y-1 text-xs">
            <li>• Vérifiez la compatibilité avec votre alimentation</li>
            <li>• La VRAM influence les performances en haute résolution</li>
            <li>• Le boost clock dépend du refroidissement</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)

export default GraphicCardFields
// }
