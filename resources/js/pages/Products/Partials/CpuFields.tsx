import React from 'react'
import { Input } from '@/components/ui/input'
import { Cpu } from 'lucide-react'

export interface CpuData {
  model: string
  socket: string
  cores: number
  threads: number
  base_clock: number
  turbo_clock?: number | null
  lithography?: number | null
  tdp?: number | null
  cache_l1?: number | null
  cache_l2?: number | null
  cache_l3?: number | null
  hyperthreading: boolean
  integrated_graphics: boolean
}

interface Props {
  data: CpuData
  setData: <K extends keyof CpuData>(field: K, value: CpuData[K]) => void
  errors?: Partial<Record<keyof CpuData, string>>
}

const CpuFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <Cpu className="w-5 h-5 text-red-500" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        Spécifications Processeur
      </h3>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white shadow-sm
                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Modèle */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Modèle <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={data.model}
            onChange={e => setData('model', e.target.value)}
            placeholder="Intel Core i7-12700K"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.model && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.model}</div>
          )}
        </div>

        {/* Socket */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Socket <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={data.socket}
            onChange={e => setData('socket', e.target.value)}
            placeholder="LGA1700"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.socket && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.socket}</div>
          )}
        </div>

        {/* Cœurs */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cœurs <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min={1}
            value={data.cores}
            onChange={e => setData('cores', Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.cores && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.cores}</div>
          )}
        </div>

        {/* Threads */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Threads <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min={1}
            value={data.threads}
            onChange={e => setData('threads', Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.threads && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.threads}</div>
          )}
        </div>

        {/* Fréquence base */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Fréquence base (GHz) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            step={0.01}
            min={0}
            value={data.base_clock}
            onChange={e => setData('base_clock', Number(e.target.value))}
            placeholder="3.60"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.base_clock && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.base_clock}</div>
          )}
        </div>

        {/* Boost */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Boost (GHz)
          </label>
          <Input
            type="number"
            step={0.01}
            min={0}
            value={data.turbo_clock ?? ''}
            onChange={e => setData('turbo_clock', e.target.value === '' ? null : Number(e.target.value))}
            placeholder="5.00"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.turbo_clock && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.turbo_clock}</div>
          )}
        </div>

        {/* Lithographie */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Lithographie (nm)
          </label>
          <Input
            type="number"
            min={0}
            value={data.lithography ?? ''}
            onChange={e => setData('lithography', e.target.value === '' ? null : Number(e.target.value))}
            placeholder="10"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.lithography && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.lithography}</div>
          )}
        </div>

        {/* TDP */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            TDP (W)
          </label>
          <Input
            type="number"
            min={0}
            value={data.tdp ?? ''}
            onChange={e => setData('tdp', e.target.value === '' ? null : Number(e.target.value))}
            placeholder="125"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.tdp && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.tdp}</div>
          )}
        </div>

        {/* Cache L1 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cache L1 (KB)
          </label>
          <Input
            type="number"
            min={0}
            value={data.cache_l1 ?? ''}
            onChange={e => setData('cache_l1', e.target.value === '' ? null : Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.cache_l1 && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.cache_l1}</div>
          )}
        </div>

        {/* Cache L2 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cache L2 (KB)
          </label>
          <Input
            type="number"
            min={0}
            value={data.cache_l2 ?? ''}
            onChange={e => setData('cache_l2', e.target.value === '' ? null : Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.cache_l2 && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.cache_l2}</div>
          )}
        </div>

        {/* Cache L3 */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cache L3 (MB)
          </label>
          <Input
            type="number"
            min={0}
            value={data.cache_l3 ?? ''}
            onChange={e => setData('cache_l3', e.target.value === '' ? null : Number(e.target.value))}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.cache_l3 && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.cache_l3}</div>
          )}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="mt-6 space-y-4">
        <div className="flex items-center space-x-2">
          <input
            id="integrated_graphics"
            type="checkbox"
            checked={data.integrated_graphics}
            onChange={e => setData('integrated_graphics', e.target.checked)}
            className="w-4 h-4 text-red-600 bg-white border-slate-300 rounded focus:ring-red-500 focus:ring-2 dark:bg-slate-800 dark:border-slate-600"
          />
          <label htmlFor="integrated_graphics" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Processeur avec iGPU intégré
          </label>
          {errors.integrated_graphics && (
            <div className="text-xs text-red-600 dark:text-red-400">{errors.integrated_graphics}</div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="hyperthreading"
            type="checkbox"
            checked={data.hyperthreading}
            onChange={e => setData('hyperthreading', e.target.checked)}
            className="w-4 h-4 text-red-600 bg-white border-slate-300 rounded focus:ring-red-500 focus:ring-2 dark:bg-slate-800 dark:border-slate-600"
          />
          <label htmlFor="hyperthreading" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Hyper-Threading activé
          </label>
          {errors.hyperthreading && (
            <div className="text-xs text-red-600 dark:text-red-400">{errors.hyperthreading}</div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Conseils pour les processeurs :</p>
          <ul className="space-y-1 text-xs">
            <li>• Vérifiez la compatibilité du socket avec la carte mère</li>
            <li>• Le TDP influence le choix du refroidissement</li>
            <li>• Les fréquences sont exprimées en GHz</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)

export default CpuFields

