import Heading from '@/components/heading'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { type NavItem } from '@/types'
import { Link } from '@inertiajs/react'
import { type PropsWithChildren } from 'react'

// Onglets de navigation
const sidebarNavItems: NavItem[] = [
  {
    title: 'Profil',
    href: '/settings/profile',
    icon: null,
  },
  {
    title: 'Mot de passe',
    href: '/settings/password',
    icon: null,
  },
  {
    title: 'Apparence',
    href: '/settings/appearance',
    icon: null,
  },
  {
    title: 'Préférences',
    href: '/settings/app',
    icon: null,
  },
]

export default function SettingsLayout({ children }: PropsWithChildren) {
  // Empêche le SSR (pas obligatoire mais préventif si pathname dépend du DOM)
  if (typeof window === 'undefined') return null

  const currentPath = window.location.pathname

  return (
    <div className="px-4 py-6">
      <Heading
        title="Paramètres"
        description="Gérez votre profil, votre mot de passe et vos préférences d’application"
      />

      <div className="mt-6 flex flex-col lg:flex-row lg:space-x-8">
        {/* Barre latérale */}
       <aside className="w-full max-w-full p-0 lg:w-60">
  <nav className="flex flex-col gap-1">
    {sidebarNavItems.map((item) => {
      const isActive = currentPath === item.href
      return (
        <Button
          key={item.href}
          size="sm"
          variant="ghost"
          asChild
          className={cn(
            'w-full justify-start rounded-md px-3 py-2 text-sm transition-colors',
            isActive
              ? 'bg-primary/10 text-primary font-semibold'
              : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
          )}
        >
          <Link href={item.href} prefetch>{item.title}</Link>
        </Button>
      )
    })}
  </nav>
</aside>


        <Separator className="my-6 lg:hidden" />

        {/* Contenu principal */}
        <main className="flex-1 rounded-xl bg-white/70 p-6 shadow dark:bg-white/5 dark:shadow-md border border-slate-200 dark:border-slate-700">
          {children}
        </main>
      </div>
    </div>
  )
}
