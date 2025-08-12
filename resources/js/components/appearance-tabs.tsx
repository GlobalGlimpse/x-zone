import { Appearance, useAppearance } from '@/hooks/use-appearance'
import { cn } from '@/lib/utils'
import { LucideIcon, Monitor, Moon, Sun } from 'lucide-react'
import { HTMLAttributes } from 'react'

export default function AppearanceToggleTab({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { appearance, updateAppearance } = useAppearance()

  const tabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Clair' },
    { value: 'dark', icon: Moon, label: 'Sombre' },
    // { value: 'system', icon: Monitor, label: 'Système' },
  ]

  return (
    <div
      {...props}
      className={cn(
        'inline-flex gap-1 rounded-lg border border-slate-200 bg-white p-1 backdrop-blur-md shadow-sm ' +
          'dark:border-slate-700 dark:bg-white/5',
        className
      )}
    >
      {tabs.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => updateAppearance(value)}
          className={cn(
            'flex items-center rounded-md px-4 py-2 text-sm font-medium transition-all',
            appearance === value
              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow'
              : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
          )}
        >
          <Icon className="mr-2 size-4" />
          {label}
        </button>
      ))}
    </div>
  )
}
