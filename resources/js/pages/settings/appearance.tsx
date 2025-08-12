import { Head } from '@inertiajs/react'

import AppearanceTabs from '@/components/appearance-tabs'
import HeadingSmall from '@/components/heading-small'
import { type BreadcrumbItem } from '@/types'

import AppLayout from '@/layouts/app-layout'
import SettingsLayout from '@/layouts/settings/layout'

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Apparence',
    href: '/settings/appearance',
  },
]

export default function Appearance() {
  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Paramètres d’apparence" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            title="Paramètres d’apparence"
            description="Personnalisez le thème et les préférences visuelles de votre compte"
          />
          <AppearanceTabs />
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
