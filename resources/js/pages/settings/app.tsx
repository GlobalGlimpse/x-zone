import { Head, useForm } from '@inertiajs/react'
import { useRef } from 'react'
import { BreadcrumbItem } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import InputError from '@/components/input-error'
import HeadingSmall from '@/components/heading-small'
import AppLayout from '@/layouts/app-layout'
import SettingsLayout from '@/layouts/settings/layout'

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

const SectionTitle = ({
  title,
  description,
}: {
  title: string
  description?: string
}) => (
  <div className="space-y-1">
    <h2 className="text-lg font-semibold leading-tight">{title}</h2>
    {description && (
      <p className="text-sm text-muted-foreground">{description}</p>
    )}
  </div>
)

// utilitaire pour avoir le même style input / textarea
const fieldClass =
  'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ' +
  'placeholder:text-muted-foreground shadow-sm ' +
  'focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'dark:border-slate-700 dark:text-white dark:placeholder-slate-400'

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Paramètres généraux', href: '/settings/app' },
]

/* ------------------------------------------------------------------ */
/*  Composant principal                                               */
/* ------------------------------------------------------------------ */

export default function AppSettings({
  settings,
  flash,
}: {
  settings: any
  flash?: { success?: string }
}) {
  const { data, setData, post, processing, errors, recentlySuccessful } =
    useForm({
      app_name: settings.app_name ?? '',
      app_slogan: settings.app_slogan ?? '',
      primary_color: settings.primary_color ?? '#6366f1',
      secondary_color: settings.secondary_color ?? '#f59e42',
      contact_email: settings.contact_email ?? '',
      contact_phone: settings.contact_phone ?? '',
      contact_address: settings.contact_address ?? '',
      cgu_url: settings.cgu_url ?? '',
      privacy_url: settings.privacy_url ?? '',
      copyright: settings.copyright ?? '',
      meta_keywords: settings.meta_keywords ?? '',
      meta_description: settings.meta_description ?? '',
      twitter: settings.social_links?.twitter ?? '',
      facebook: settings.social_links?.facebook ?? '',
      instagram: settings.social_links?.instagram ?? '',
      linkedin: settings.social_links?.linkedin ?? '',
      logo: null,
      logo_dark: null,
      favicon: null,
    })

  const logoInput = useRef<HTMLInputElement>(null)
  const logoDarkInput = useRef<HTMLInputElement>(null)
  const faviconInput = useRef<HTMLInputElement>(null)

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, type, value, files } = e.target
    setData(name, type === 'file' ? files?.[0] ?? null : value)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    post(route('settings.app.update'), { forceFormData: true })
  }

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Paramètres de l'application" />

      <SettingsLayout>
        <form onSubmit={submit} className="space-y-10 p-6">

          {/* ---------------------------------------------------------- */}
          {/* Identité visuelle                                         */}
          {/* ---------------------------------------------------------- */}
          <section className="space-y-4">
            <SectionTitle title="Identité visuelle" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="app_name">Nom de l'application</Label>
                <Input
                  id="app_name"
                  name="app_name"
                  value={data.app_name}
                  onChange={handleChange}
                />
                <InputError message={errors.app_name} />
              </div>

              <div>
                <Label htmlFor="app_slogan">Slogan</Label>
                <Input
                  id="app_slogan"
                  name="app_slogan"
                  value={data.app_slogan}
                  onChange={handleChange}
                />
                <InputError message={errors.app_slogan} />
              </div>

              <div>
                <Label htmlFor="primary_color">Couleur principale</Label>
                <Input
                  id="primary_color"
                  name="primary_color"
                  type="color"
                  value={data.primary_color}
                  onChange={handleChange}
                  className="w-16 h-10 p-0 border-none"
                />
                <InputError message={errors.primary_color} />
              </div>

              <div>
                <Label htmlFor="secondary_color">Couleur secondaire</Label>
                <Input
                  id="secondary_color"
                  name="secondary_color"
                  type="color"
                  value={data.secondary_color}
                  onChange={handleChange}
                  className="w-16 h-10 p-0 border-none"
                />
                <InputError message={errors.secondary_color} />
              </div>

              <div>
                <Label htmlFor="logo">Logo clair</Label>
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  ref={logoInput}
                />
                <InputError message={errors.logo} />
                {settings.logo_path && (
                  <img
                    src={`/storage/${settings.logo_path}`}
                    alt="Logo actuel"
                    className="w-28 mt-2 border rounded"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="logo_dark">Logo sombre</Label>
                <Input
                  id="logo_dark"
                  name="logo_dark"
                  type="file"
                  accept="image/*"
                  onChange={handleChange}
                  ref={logoDarkInput}
                />
                <InputError message={errors.logo_dark} />
                {settings.logo_dark_path && (
                  <img
                    src={`/storage/${settings.logo_dark_path}`}
                    alt="Logo sombre"
                    className="w-28 mt-2 border rounded bg-neutral-900"
                  />
                )}
              </div>

              <div>
                <Label htmlFor="favicon">Favicon</Label>
                <Input
                  id="favicon"
                  name="favicon"
                  type="file"
                  accept="image/png, image/x-icon"
                  onChange={handleChange}
                  ref={faviconInput}
                />
                <InputError message={errors.favicon} />
                {settings.favicon_path && (
                  <img
                    src={`/storage/${settings.favicon_path}`}
                    alt="Favicon"
                    className="w-10 h-10 border rounded bg-white"
                  />
                )}
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Coordonnées                                               */}
          {/* ---------------------------------------------------------- */}
          <section className="space-y-4">
            <SectionTitle title="Coordonnées de contact" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contact_email">Email</Label>
                <Input
                  id="contact_email"
                  name="contact_email"
                  value={data.contact_email}
                  onChange={handleChange}
                />
                <InputError message={errors.contact_email} />
              </div>
              <div>
                <Label htmlFor="contact_phone">Téléphone</Label>
                <Input
                  id="contact_phone"
                  name="contact_phone"
                  value={data.contact_phone}
                  onChange={handleChange}
                />
                <InputError message={errors.contact_phone} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="contact_address">Adresse</Label>
                <Input
                  id="contact_address"
                  name="contact_address"
                  value={data.contact_address}
                  onChange={handleChange}
                />
                <InputError message={errors.contact_address} />
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Mentions légales                                          */}
          {/* ---------------------------------------------------------- */}
          <section className="space-y-4">
            <SectionTitle title="Mentions légales" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="cgu_url">URL des CGU</Label>
                <Input
                  id="cgu_url"
                  name="cgu_url"
                  value={data.cgu_url}
                  onChange={handleChange}
                />
                <InputError message={errors.cgu_url} />
              </div>
              <div>
                <Label htmlFor="privacy_url">Politique de confidentialité</Label>
                <Input
                  id="privacy_url"
                  name="privacy_url"
                  value={data.privacy_url}
                  onChange={handleChange}
                />
                <InputError message={errors.privacy_url} />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="copyright">Copyright</Label>
                <Input
                  id="copyright"
                  name="copyright"
                  value={data.copyright}
                  onChange={handleChange}
                />
                <InputError message={errors.copyright} />
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Réseaux sociaux                                           */}
          {/* ---------------------------------------------------------- */}
          <section className="space-y-4">
            <SectionTitle title="Réseaux sociaux" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={data.twitter}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={data.facebook}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={data.instagram}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={data.linkedin}
                  onChange={handleChange}
                />
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* SEO                                                       */}
          {/* ---------------------------------------------------------- */}
          <section className="space-y-4">
            <SectionTitle title="Référencement (SEO)" />
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="meta_keywords">Mots-clés</Label>
                <Textarea
                  id="meta_keywords"
                  name="meta_keywords"
                  value={data.meta_keywords}
                  onChange={handleChange}
                  rows={2}
                  className={fieldClass}
                />
              </div>
              <div>
                <Label htmlFor="meta_description">Description</Label>
                <Textarea
                  id="meta_description"
                  name="meta_description"
                  value={data.meta_description}
                  onChange={handleChange}
                  rows={3}
                  className={fieldClass}
                />
              </div>
            </div>
          </section>

          {/* ---------------------------------------------------------- */}
          {/* Bouton enregistrer                                        */}
          {/* ---------------------------------------------------------- */}
          <div className="pt-4 flex items-center gap-4">
            <Button type="submit" disabled={processing}>
              Enregistrer
            </Button>
            {recentlySuccessful && (
              <span className="text-sm text-green-600">Enregistré&nbsp;!</span>
            )}
          </div>
        </form>
      </SettingsLayout>
    </AppLayout>
  )
}
