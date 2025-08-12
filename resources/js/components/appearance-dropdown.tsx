import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAppearance } from '@/hooks/use-appearance'
import { Monitor, Moon, Sun } from 'lucide-react'
import { HTMLAttributes } from 'react'

export default function AppearanceToggleDropdown({
  className = '',
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { appearance, updateAppearance } = useAppearance()

  const Icon = () => {
    switch (appearance) {
      case 'dark':
        return <Moon className="size-5 text-white" />
      case 'light':
        return <Sun className="size-5 text-yellow-500" />
      default:
        return <Monitor className="size-5 text-slate-400 dark:text-white" />
    }
  }

  return (
    <div className={className} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-md border border-slate-200 bg-white shadow-sm
                       hover:bg-slate-100
                       dark:border-slate-700 dark:bg-white/10 dark:hover:bg-white/20"
          >
            <Icon />
            <span className="sr-only">Changer le thème</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="min-w-48 rounded-md border border-slate-200 bg-white p-1 shadow-md
                     dark:border-slate-700 dark:bg-slate-900"
        >
          <DropdownMenuItem onClick={() => updateAppearance('light')}>
            <Sun className="mr-2 size-5 text-yellow-500" />
            Clair
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => updateAppearance('dark')}>
            <Moon className="mr-2 size-5 text-white" />
            Sombre
          </DropdownMenuItem>
          {/* <DropdownMenuItem onClick={() => updateAppearance('system')}>
            <Monitor className="mr-2 size-5 text-slate-400 dark:text-white" />
            Système
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
