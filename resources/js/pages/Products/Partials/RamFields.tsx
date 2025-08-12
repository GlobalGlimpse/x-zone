/* ------------------------------------------------------------------
   RamFields.tsx  –  Formulaire limité selon la migration `rams`
   ------------------------------------------------------------------
   - type, form_factor : VARCHAR(10)  → maxLength={10}
   - capacity, speed   : UNSIGNED SMALLINT (0-65535)
   - voltage           : DECIMAL(3,2)  (0.00-9.99)  → step 0.01, max 9.99
   - module_count      : TINYINT (0-255)
------------------------------------------------------------------- */

import React from 'react'

export interface RamData {
  type: string
  form_factor: string
  capacity: number
  speed: number
  voltage: string
  ecc: boolean
  buffered: boolean
  rank?: string
  module_count: number
}

interface Props {
  data: RamData
  setData: <K extends keyof RamData>(field: K, value: RamData[K]) => void
  errors?: Partial<Record<keyof RamData, string>>
}

export const RamFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
        <div className="w-3 h-2 bg-white rounded-sm"></div>
      </div>
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        Spécifications Mémoire RAM
      </h3>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white shadow-sm
                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type (10 car. max) ------------------------------------------------ */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={10}
            placeholder="DDR4"
            value={data.type}
            onChange={e => setData('type', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.type && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.type}</div>
          )}
        </div>

        {/* Form-factor (DIMM, SO-DIMM…) ------------------------------------- */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Form-factor <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            maxLength={10}
            placeholder="DIMM"
            value={data.form_factor}
            onChange={e => setData('form_factor', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.form_factor && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.form_factor}</div>
          )}
        </div>

        {/* Capacity --------------------------------------------------------- */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Capacité (GB) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={65535}
            value={data.capacity}
            onChange={e => setData('capacity', Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.capacity && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.capacity}</div>
          )}
        </div>

        {/* Speed ------------------------------------------------------------ */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Fréquence (MHz) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={65535}
            value={data.speed}
            onChange={e => setData('speed', Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.speed && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.speed}</div>
          )}
        </div>

        {/* Voltage ---------------------------------------------------------- */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Tension (V) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step={0.01}
            min={0}
            max={9.99}
            placeholder="1.20"
            value={data.voltage}
            onChange={e => setData('voltage', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.voltage && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.voltage}</div>
          )}
        </div>

        {/* Module count ----------------------------------------------------- */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Nb modules <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min={1}
            max={255}
            value={data.module_count}
            onChange={e => setData('module_count', Number(e.target.value))}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.module_count && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.module_count}</div>
          )}
        </div>

        {/* ECC -------------------------------------------------------------- */}
        <div className="flex items-center">
          <input
            id="ram-ecc"
            type="checkbox"
            checked={data.ecc}
            onChange={e => setData('ecc', e.target.checked)}
            className="h-4 w-4 text-red-600 border-slate-300 dark:border-slate-600 rounded focus:ring-red-500"
          />
          <label htmlFor="ram-ecc" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
            ECC
          </label>
        </div>

        {/* Buffered --------------------------------------------------------- */}
        <div className="flex items-center">
          <input
            id="ram-buffered"
            type="checkbox"
            checked={data.buffered}
            onChange={e => setData('buffered', e.target.checked)}
            className="h-4 w-4 text-red-600 border-slate-300 dark:border-slate-600 rounded focus:ring-red-500"
          />
          <label htmlFor="ram-buffered" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
            Buffered
          </label>
        </div>

        {/* Rank ------------------------------------------------------------- */}
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Rank
          </label>
          <input
            type="text"
            maxLength={20}
            value={data.rank ?? ''}
            onChange={e => setData('rank', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.rank && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.rank}</div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Conseils pour la mémoire RAM :</p>
          <ul className="space-y-1 text-xs">
            <li>• Vérifiez la compatibilité avec votre carte-mère</li>
            <li>• Plus la fréquence est élevée, meilleures sont les performances</li>
            <li>• ECC recommandé pour les serveurs critiques</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)
// }
