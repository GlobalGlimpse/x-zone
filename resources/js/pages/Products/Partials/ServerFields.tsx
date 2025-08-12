// --- ServerFields.tsx ---
import React from 'react'

export interface ServerData {
  cpu_sockets: number
  cpu_model?: string
  installed_memory: number
  max_memory: number
  memory_type?: 'DDR3' | 'DDR4' | 'DDR5'

  drive_bays: number
  storage_type: 'HDD' | 'SSD' | 'Hybrid'
  storage_capacity: number
  raid_support: 'None' | 'RAID 0' | 'RAID 1' | 'RAID 5' | 'RAID 10'

  ethernet_ports: number
  ethernet_speed: '1Gbps' | '10Gbps' | '25Gbps' | '40Gbps' | '100Gbps'
  fiber_channel: boolean

  rack_units: number
  form_factor?: 'Rack' | 'Tower' | 'Blade'
  redundant_power_supplies: boolean
  condition: 'new' | 'used' | 'refurbished'
}

export default function ServerFields({
  data, setData, errors = {}
}: {
  data: ServerData
  setData: <K extends keyof ServerData>(field: K, value: ServerData[K]) => void
  errors?: Partial<Record<keyof ServerData, string>>
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-5 h-5 bg-red-500 rounded-sm flex items-center justify-center">
          <div className="w-3 h-3 bg-white rounded-sm border border-red-500"></div>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Spécifications Serveur
        </h3>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CPU sockets */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              CPU sockets <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min={1} max={8} value={data.cpu_sockets}
              onChange={e => setData('cpu_sockets', Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              required
            />
            {errors.cpu_sockets && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.cpu_sockets}</div>
            )}
          </div>

          {/* CPU model */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              CPU model
            </label>
            <input
              type="text" value={data.cpu_model ?? ''}
              onChange={e => setData('cpu_model', e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              maxLength={100}
            />
            {errors.cpu_model && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.cpu_model}</div>
            )}
          </div>

          {/* Installed memory */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Installed memory (GB) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min={0} max={4096} value={data.installed_memory}
              onChange={e => setData('installed_memory', Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            {errors.installed_memory && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.installed_memory}</div>
            )}
          </div>

          {/* Max memory */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Max memory (GB) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min={1} max={4096} value={data.max_memory}
              onChange={e => setData('max_memory', Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              required
            />
            {errors.max_memory && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.max_memory}</div>
            )}
          </div>

          {/* Memory type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Memory type
            </label>
            <select
              value={data.memory_type ?? ''}
              onChange={e => setData('memory_type', e.target.value as ServerData['memory_type'])}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="" className="text-slate-500">--</option>
              <option value="DDR3">DDR3</option>
              <option value="DDR4">DDR4</option>
              <option value="DDR5">DDR5</option>
            </select>
            {errors.memory_type && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.memory_type}</div>
            )}
          </div>

          {/* Drive bays */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Drive bays <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min={0} max={24} value={data.drive_bays}
              onChange={e => setData('drive_bays', Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            {errors.drive_bays && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.drive_bays}</div>
            )}
          </div>

          {/* Storage type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Storage type <span className="text-red-500">*</span>
            </label>
            <select
              value={data.storage_type}
              onChange={e => setData('storage_type', e.target.value as ServerData['storage_type'])}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              required
            >
              <option value="HDD">HDD</option>
              <option value="SSD">SSD</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            {errors.storage_type && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.storage_type}</div>
            )}
          </div>

          {/* Storage capacity */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Storage capacity (GB) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min={0} max={16384} value={data.storage_capacity}
              onChange={e => setData('storage_capacity', Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            {errors.storage_capacity && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.storage_capacity}</div>
            )}
          </div>

          {/* RAID support */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              RAID support <span className="text-red-500">*</span>
            </label>
            <select
              value={data.raid_support}
              onChange={e => setData('raid_support', e.target.value as ServerData['raid_support'])}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="None">None</option>
              <option value="RAID 0">RAID 0</option>
              <option value="RAID 1">RAID 1</option>
              <option value="RAID 5">RAID 5</option>
              <option value="RAID 10">RAID 10</option>
            </select>
            {errors.raid_support && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.raid_support}</div>
            )}
          </div>

          {/* Ethernet ports */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Ethernet ports <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min={1} max={8} value={data.ethernet_ports}
              onChange={e => setData('ethernet_ports', Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            />
            {errors.ethernet_ports && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.ethernet_ports}</div>
            )}
          </div>

          {/* Ethernet speed */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Ethernet speed <span className="text-red-500">*</span>
            </label>
            <select
              value={data.ethernet_speed}
              onChange={e => setData('ethernet_speed', e.target.value as ServerData['ethernet_speed'])}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="1Gbps">1Gbps</option>
              <option value="10Gbps">10Gbps</option>
              <option value="25Gbps">25Gbps</option>
              <option value="40Gbps">40Gbps</option>
              <option value="100Gbps">100Gbps</option>
            </select>
            {errors.ethernet_speed && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.ethernet_speed}</div>
            )}
          </div>

          {/* Rack units */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Rack units (U) <span className="text-red-500">*</span>
            </label>
            <input
              type="number" min={1} max={10} value={data.rack_units}
              onChange={e => setData('rack_units', Number(e.target.value))}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              required
            />
            {errors.rack_units && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.rack_units}</div>
            )}
          </div>

          {/* Form factor */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Form factor
            </label>
            <select
              value={data.form_factor ?? ''}
              onChange={e => setData('form_factor', e.target.value as ServerData['form_factor'])}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
            >
              <option value="" className="text-slate-500">--</option>
              <option value="Rack">Rack</option>
              <option value="Tower">Tower</option>
              <option value="Blade">Blade</option>
            </select>
            {errors.form_factor && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.form_factor}</div>
            )}
          </div>

          {/* Fiber Channel */}
          <div className="flex items-center">
            <input
              type="checkbox" checked={data.fiber_channel}
              onChange={e => setData('fiber_channel', e.target.checked)}
              className="h-4 w-4 text-red-600 border-slate-300 dark:border-slate-600 rounded focus:ring-red-500"
            />
            <label className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              Fiber Channel présent
            </label>
            {errors.fiber_channel && (
              <div className="text-xs text-red-600 dark:text-red-400 ml-3">{errors.fiber_channel}</div>
            )}
          </div>

          {/* Redundant PSU */}
          <div className="flex items-center">
            <input
              type="checkbox" checked={data.redundant_power_supplies}
              onChange={e => setData('redundant_power_supplies', e.target.checked)}
              className="h-4 w-4 text-red-600 border-slate-300 dark:border-slate-600 rounded focus:ring-red-500"
            />
            <label className="ml-2 text-sm text-slate-700 dark:text-slate-300">
              Alimentations redondantes
            </label>
            {errors.redundant_power_supplies && (
              <div className="text-xs text-red-600 dark:text-red-400 ml-3">{errors.redundant_power_supplies}</div>
            )}
          </div>

          {/* Condition */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              État <span className="text-red-500">*</span>
            </label>
            <select
              value={data.condition}
              onChange={e => setData('condition', e.target.value as ServerData['condition'])}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
              required
            >
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
            <p className="font-medium mb-1">Conseils pour les serveurs :</p>
            <ul className="space-y-1 text-xs">
              <li>• Vérifiez la compatibilité rack avant l'achat</li>
              <li>• Les alimentations redondantes améliorent la disponibilité</li>
              <li>• Considérez les besoins futurs en mémoire et stockage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
