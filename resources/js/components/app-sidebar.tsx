import { useEffect, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { NavUser } from '@/components/nav-user'
import { type NavItem, type SharedData, type AppSettings } from '@/types'
import {
  Home,
  Users,
  User,
  UserCog,
  Key,
  History,
  ClipboardList,
  LogIn,
  Boxes,
  Layers,
  Package,
  Building2,
  FileSignature,
  FileText,
  Receipt,
  Warehouse,
  Repeat,
  LineChart,
  Percent,
  Wallet,
  CircleDollarSign,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppearance } from '@/hooks/use-appearance'

type Props = SharedData & { settings: AppSettings }

const elementsNavigation: NavItem[] = [
  { title: 'Tableau de bord', href: '/dashboard', icon: Home },
  {
    title: 'Gestion des utilisateurs',
    icon: Users,
    children: [
      { title: 'Utilisateurs', href: '/users', icon: User },
      { title: 'Rôles', href: '/roles', icon: UserCog },
      { title: 'Permissions', href: '/permissions', icon: Key },
    ],
  },
  {
    title: 'Historique des journaux',
    icon: History,
    children: [
      { title: "Journaux d'audit", href: '/audit-logs', icon: ClipboardList },
      { title: 'Connexions', href: '/login-logs', icon: LogIn },
    ],
  },
  {
    title: 'Catalogue',
    icon: Boxes,
    children: [
      { title: 'Catégories', href: '/categories', icon: Layers },
      { title: 'Produits', href: '/products', icon: Package },
    ],
  },
  {
    title: 'Gestion commerciale',
    icon: Building2,
    children: [
      { title: 'Clients', href: '/clients', icon: Users },           // ou Briefcase si tu préfères
      { title: 'Devis', href: '/quotes', icon: FileSignature },
      { title: 'Factures', href: '/invoices', icon: Receipt },
    ],
  },
  {
    title: 'Gestion de stock',
    icon: Warehouse,
    children: [
      { title: 'Mouvements de stock', href: '/stock-movements', icon: Repeat },
      { title: 'Rapport de stock', href: '/stock-movements/report', icon: LineChart },
    ],
  },
  {
    title: 'Paramètres financiers',
    icon: Wallet,
    children: [
      { title: 'TVA', href: '/tax-rates', icon: Percent },
      { title: 'Devises', href: '/currencies', icon: CircleDollarSign },
    ],
  },
]

export function AppSidebar() {
  const { url, props: { settings } } = usePage<Props>()
  const { isDark } = useAppearance()
  const { state: sidebarState } = useSidebar()
  const estRéduit = sidebarState === 'collapsed'
  const [menusOuverts, setMenusOuverts] = useState<string[]>([])

  useEffect(() => {
    elementsNavigation.forEach(item => {
      if (item.children && item.children.some(c => estActif(c.href))) {
        if (!menusOuverts.includes(item.title)) {
          setMenusOuverts(prev => [...prev, item.title])
        }
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url])

  const basculerMenu = (titre: string) =>
    setMenusOuverts(prev =>
      prev.includes(titre) ? prev.filter(x => x !== titre) : [...prev, titre]
    )

  const estActif = (href?: string) => {
    if (!href) return false
    if (href === '/') return url === '/'
    if (url === href) return true

    const allHrefs = getAllHrefs(elementsNavigation)
    const urlStartsWithHref = url.startsWith(href + '/')
    const longerMatchingHrefs = allHrefs.filter(
      h => h !== href && h.startsWith(href + '/') && url.startsWith(h)
    )

    return urlStartsWithHref && longerMatchingHrefs.length === 0
  }

  const getAllHrefs = (items: NavItem[]): string[] => {
    const hrefs: string[] = []
    items.forEach(item => {
      if (item.href) hrefs.push(item.href)
      if (item.children) hrefs.push(...getAllHrefs(item.children))
    })
    return hrefs
  }

  const logoUrl = isDark ? settings.logo_dark_url || settings.logo_url : settings.logo_url

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" className="flex justify-center py-4">
                <img
                  key={logoUrl}
                  src={logoUrl || '/logo.svg'}
                  alt={settings.app_name}
                  className="h-10 w-auto object-contain rounded"
                />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-hidden text-sidebar-foreground">
        <nav className="space-y-1">
          {elementsNavigation.map(item =>
            item.children ? (
              <div key={item.title}>
                <button
                  onClick={() => basculerMenu(item.title)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    menusOuverts.includes(item.title)
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <div className="flex items-center">
                    {item.icon && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                    {!estRéduit && <span className="truncate">{item.title}</span>}
                  </div>
                  {!estRéduit && (
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 transition-transform',
                        menusOuverts.includes(item.title) && 'rotate-180'
                      )}
                    />
                  )}
                </button>
                {!estRéduit && menusOuverts.includes(item.title) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map(child => (
                      <Link
                        key={child.title}
                        href={child.href!}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                          estActif(child.href)
                            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                            : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                        )}
                      >
                        {child.icon && <child.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                        <span className="truncate">{child.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.title}
                href={item.href!}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  estActif(item.href)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground'
                )}
              >
                {item.icon && <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />}
                {!estRéduit && <span className="truncate">{item.title}</span>}
              </Link>
            )
          )}
        </nav>
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}

export default AppSidebar
