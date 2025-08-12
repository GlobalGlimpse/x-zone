import React from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus, X, Link2, Info } from 'lucide-react'

type CompatibilityEntry = {
  compatible_with_id: string
  direction?: 'bidirectional' | 'uni'
  note?: string
}

interface Props {
  compatibilities: CompatibilityEntry[]
  allProducts: { id: string; name: string }[]
  onChange: (list: CompatibilityEntry[]) => void
  isComponentCategory?: boolean
}

export default function CompatibilityFields({
  compatibilities,
  allProducts,
  onChange,
  isComponentCategory = false
}: Props) {
  const set = (i: number, field: keyof CompatibilityEntry, value: any) => {
    const draft = [...compatibilities]
    draft[i] = { ...draft[i], [field]: value }
    onChange(draft)
  }

  const remove = (i: number) =>
    onChange(compatibilities.filter((_, idx) => idx !== i))

  const usedIds = compatibilities.map(e => e.compatible_with_id)

  const add = () => {
    const remaining = allProducts.filter(p => !usedIds.includes(p.id))
    if (remaining.length > 0) {
      onChange([
        ...compatibilities,
        {
          compatible_with_id: remaining[0].id,
          direction: 'uni',
        }
      ])
    }
  }

  const isAddDisabled = allProducts.length === usedIds.length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link2 className="w-5 h-5 text-red-500" />
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Compatibilités
        </h3>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm
                      dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">

        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">

          </p>
          <Button
            onClick={add}
            type="button"
            disabled={isAddDisabled}
            className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600
                       text-white border-none shadow-sm rounded-lg px-4 py-2 text-sm font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une compatibilité
          </Button>
        </div>

        <div className="space-y-4">
          {compatibilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12
                            border-2 border-dashed border-slate-300 dark:border-slate-600
                            rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <Link2 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Aucune compatibilité n'a été ajoutée
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Cliquez sur "Ajouter une compatibilité" pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {compatibilities.map((entry, idx) => {
                const selectedId = entry.compatible_with_id
                const availableProducts = allProducts.filter(p =>
                  !usedIds.includes(p.id) || p.id === selectedId
                )

                return (
                  <div
                    key={idx}
                    className="grid grid-cols-1 lg:grid-cols-[1fr,1.5fr,auto] gap-4 p-4
                               rounded-lg border border-slate-200 dark:border-slate-700
                               bg-slate-50 dark:bg-slate-800/50
                               hover:shadow-md hover:border-red-300 dark:hover:border-red-700
                               transition-all duration-200 group"
                  >
                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Produit compatible
                      </label>
                      <Select
                        value={entry.compatible_with_id}
                        onValueChange={v => set(idx, 'compatible_with_id', v)}
                      >
                        <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500">
                          <SelectValue placeholder="Sélectionner un produit" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableProducts.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Notes (optionnel)
                      </label>
                      <Textarea
                        placeholder="Précisions sur cette compatibilité..."
                        value={entry.note ?? ''}
                        onChange={e => set(idx, 'note', e.target.value)}
                        className="min-h-[40px] resize-none bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <Button
                        onClick={() => remove(idx)}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 w-10 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                                   opacity-0 group-hover:opacity-100 transition-all duration-200"
                      >
                        <X className="w-4 h-4" />
                        <span className="sr-only">Supprimer la compatibilité</span>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">À propos des compatibilités :</p>
            <ul className="space-y-1 text-xs">
              <li>• Les compatibilités sont unidirectionnelles vers les machines</li>
              <li>• Utilisez les notes pour préciser des conditions spécifiques</li>
              <li>• Chaque produit ne peut être ajouté qu'une seule fois</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// export default CompatibilityFields
