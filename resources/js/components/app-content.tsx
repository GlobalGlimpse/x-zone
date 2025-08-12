import { SidebarInset } from '@/components/ui/sidebar'
import * as React from 'react'

interface AppContentProps extends React.ComponentProps<'main'> {
  variant?: 'header' | 'sidebar'
}

/**
 * Dégradé identique au formulaire de connexion
 * (clair → sombre via classes `dark:`).
 */
const gradient =
  'bg-gradient-to-br from-white via-slate-100 to-slate-200 ' +
  'dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]'

export function AppContent({
  variant = 'header',
  children,
  className,
  ...props
}: AppContentProps) {
  if (variant === 'sidebar') {
    return (
      <SidebarInset
        {...props}
        className={`min-h-screen w-full ${gradient} ${className ?? ''} transition-colors duration-500`}
      >
        {children}
      </SidebarInset>
    )
  }

  return (
    <main
      {...props}
      className={`mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl ${gradient} ${
        className ?? ''
      } transition-colors duration-500`}
    >
      {children}
    </main>
  )
}
