import React from 'react'
import { Input } from '@/components/ui/input'
import { HardDrive } from 'lucide-react'

export interface HddData {
  type:            string   // HDD / SSD / NVMe
  interface:       string   // SATA, PCIe…
  capacity:        number   // GB
  form_factor:     string   // 2.5", 3.5"
  rpm?:            number | null
  read_speed?:     number | null
  write_speed?:    number | null
  nand_type?:      string | null
  mtbf?:           number | null   // heures
  warranty?:       number | null   // mois
}

type Setter = <K extends keyof HddData>(f: K, v: HddData[K]) => void
interface Props {
  data:    HddData
  setData: Setter
  errors?: Partial<Record<keyof HddData, string>>
}

const HddFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <HardDrive className="w-5 h-5 text-red-500" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        Spécifications Disque Dur
      </h3>
    </div>

    <div className="rounded-xl border border-slate-200 bg-white shadow-sm
                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={data.type}
            onChange={e => setData('type', e.target.value)}
            placeholder="HDD, SSD, NVMe..."
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.type && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.type}</div>
          )}
        </div>

        {/* Interface */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Interface <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={data.interface}
            onChange={e => setData('interface', e.target.value)}
            placeholder="SATA III, PCIe 4.0..."
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.interface && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.interface}</div>
          )}
        </div>

        {/* Capacité */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Capacité (GB) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            value={data.capacity}
            onChange={e => setData('capacity', Number(e.target.value))}
            placeholder="1000"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.capacity && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.capacity}</div>
          )}
        </div>

        {/* Form-factor */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Form-factor <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            value={data.form_factor}
            onChange={e => setData('form_factor', e.target.value)}
            placeholder="2.5\ 3.5\ M.2..."
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.form_factor && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.form_factor}</div>
          )}
        </div>

        {/* RPM */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            RPM
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            value={data.rpm ?? ''}
            onChange={e => setData('rpm', e.target.value === '' ? null : Number(e.target.value))}
            placeholder="7200"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.rpm && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.rpm}</div>
          )}
        </div>

        {/* Lecture */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Lecture (MB/s)
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            value={data.read_speed ?? ''}
            onChange={e => setData('read_speed', e.target.value === '' ? null : Number(e.target.value))}
            placeholder="550"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.read_speed && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.read_speed}</div>
          )}
        </div>

        {/* Écriture */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Écriture (MB/s)
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            value={data.write_speed ?? ''}
            onChange={e => setData('write_speed', e.target.value === '' ? null : Number(e.target.value))}
            placeholder="520"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.write_speed && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.write_speed}</div>
          )}
        </div>

        {/* Type NAND */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Type NAND
          </label>
          <Input
            type="text"
            value={data.nand_type ?? ''}
            onChange={e => setData('nand_type', e.target.value || null)}
            placeholder="TLC, QLC..."
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.nand_type && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.nand_type}</div>
          )}
        </div>

        {/* MTBF */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            MTBF (h)
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            value={data.mtbf ?? ''}
            onChange={e => setData('mtbf', e.target.value === '' ? null : Number(e.target.value))}
            placeholder="1000000"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.mtbf && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.mtbf}</div>
          )}
        </div>

        {/* Garantie */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Garantie (mois)
          </label>
          <Input
            type="number"
            min={0}
            step={1}
            value={data.warranty ?? ''}
            onChange={e => setData('warranty', e.target.value === '' ? null : Number(e.target.value))}
            placeholder="60"
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.warranty && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.warranty}</div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Conseils pour les disques durs :</p>
          <ul className="space-y-1 text-xs">
            <li>• Les SSD sont plus rapides mais plus chers que les HDD</li>
            <li>• Vérifiez la compatibilité de l'interface avec votre carte mère</li>
            <li>• Le MTBF indique la fiabilité du disque</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)

export default HddFields
