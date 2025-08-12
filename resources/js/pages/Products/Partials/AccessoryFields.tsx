import React from 'react'
import { Input } from '@/components/ui/input'
import { Package } from 'lucide-react'

export interface AccessoryData {
  type: string
  compatibility?: string
  material?: string
  dimensions?: string
}

interface Props {
  data: AccessoryData
  setData: (field: keyof AccessoryData, value: any) => void
  errors?: Partial<Record<keyof AccessoryData, string>>
}

const groupedTypes = [
  { label: 'Transport & protection', options: ['Sacoche', 'Housse', 'Étui', 'Pochette', 'Mallette', 'Coque rigide'] },
  { label: 'Alimentation', options: ['Chargeur', 'Adaptateur secteur', 'Batterie externe', 'Power bank', 'Station de charge'] },
  { label: 'Connectique', options: ['Câble USB', 'Câble HDMI', 'Câble Ethernet', 'Câble VGA', 'Câble DisplayPort', 'Convertisseur / Adaptateur', 'Répartiteur USB'] },
  { label: 'Périphériques', options: ['Souris', 'Clavier', 'Tapis de souris', 'Webcam', 'Manette', 'Lecteur de carte'] },
  { label: 'Support & ergonomie', options: ['Support PC', 'Support écran', 'Support tablette', 'Rehausseur', 'Bras articulé', 'Station d\'accueil', 'Hub USB', 'Ventilateur / Refroidisseur'] },
  { label: 'Audio & vidéo', options: ['Casque audio', 'Microphone', 'Haut-parleur', 'Enceinte Bluetooth'] },
  { label: 'Entretien', options: ['Kit de nettoyage', 'Bombe à air', 'Chiffon microfibre'] },
  { label: 'Sécurité', options: ['Verrou Kensington', 'Filtre de confidentialité'] },
  { label: 'Autres', options: ['Étiquette câble', 'Accessoire imprimante', 'Accessoire réseau', 'Accessoire stockage', 'Antenne Wi-Fi'] },
]

const materials = [
  'Plastique', 'Métal', 'Aluminium', 'Cuir', 'Tissu', 'Caoutchouc', 'Silicone', 'Verre trempé'
]

const AccessoryFields: React.FC<Props> = ({ data, setData, errors = {} }) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 mb-4">
      <Package className="w-5 h-5 text-red-500" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white">
        Spécifications Accessoire
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
          <select
            value={data.type}
            onChange={e => setData('type', e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="" className="text-slate-500">
              Sélectionnez un type...
            </option>
            {groupedTypes.map(group => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.type && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.type}</div>
          )}
        </div>

        {/* Compatibilité */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Compatibilité
          </label>
          <Input
            type="text"
            value={data.compatibility ?? ''}
            onChange={e => setData('compatibility', e.target.value)}
            placeholder="Compatible avec..."
            maxLength={100}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.compatibility && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.compatibility}</div>
          )}
        </div>

        {/* Matériau */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Matériau
          </label>
          <select
            value={data.material ?? ''}
            onChange={e => setData('material', e.target.value || null)}
            className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-md focus:border-red-500 focus:ring-1 focus:ring-red-500"
          >
            <option value="" className="text-slate-500">
              Sélectionnez un matériau...
            </option>
            {materials.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          {errors.material && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.material}</div>
          )}
        </div>

        {/* Dimensions */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Dimensions
          </label>
          <Input
            type="text"
            value={data.dimensions ?? ''}
            onChange={e => setData('dimensions', e.target.value)}
            placeholder="L x l x h (cm)"
            maxLength={30}
            className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
          />
          {errors.dimensions && (
            <div className="text-xs text-red-600 dark:text-red-400 mt-1">{errors.dimensions}</div>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Conseils pour les accessoires :</p>
          <ul className="space-y-1 text-xs">
            <li>• Vérifiez la compatibilité avec vos appareils</li>
            <li>• Précisez les dimensions pour les accessoires de transport</li>
            <li>• Le matériau influence la durabilité et le prix</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
)

export default AccessoryFields
