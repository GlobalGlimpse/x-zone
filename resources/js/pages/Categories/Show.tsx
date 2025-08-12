import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  ArrowLeft, Pencil, Tag, Hash, Package, Calendar, Clock,
} from 'lucide-react';

import AppLayout from '@/layouts/app-layout';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Button } from '@/components/ui/button';

/* ---------- Types ---------- */
interface Product {
  id: string;
  name: string;
  model?: string | null;
  brand?: string | null;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  products: Product[];
}

interface Props {
  category: Category;
}

/* ---------- Vue ---------- */
export default function ShowCategory({ category }: Props) {
  const isDeleted = Boolean(category.deleted_at);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <>
      <Head title={`Catégorie – ${category.name}`} />

      <div className="relative min-h-screen bg-gradient-to-br
                      from-white via-slate-100 to-slate-200
                      dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749]
                      transition-colors duration-500">
        <ParticlesBackground />

        <AppLayout breadcrumbs={[
          { title: 'Dashboard',   href: '/dashboard' },
          { title: 'Catégories',  href: '/categories' },
          { title: category.name, href: `/categories/${category.id}` },
        ]}>

          <div className="p-6">

            {/* ========= Header ========= */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-0">
                Détails de la catégorie
              </h1>

              <div className="flex space-x-3">
                <Link href="/categories">
                  <Button variant="ghost"
                          className="bg-muted hover:bg-muted/80 text-slate-700 dark:text-slate-300">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Retour
                  </Button>
                </Link>

                {!isDeleted && (
                  <Link href={`/categories/${category.id}/edit`}>
                    <Button className="group relative flex items-center justify-center
                                       rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-5 py-3
                                       text-sm font-semibold text-white shadow-md transition-all
                                       hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500">
                      <Pencil className="w-4 h-4 mr-2" />
                      Modifier
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* ========= Content ========= */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* ----- Col 1 : Infos ----- */}
              <div className="lg:col-span-1">
                {/* --- Informations (inchangé) --- */}
                <section className="h-fit rounded-xl border border-slate-200 bg-white shadow-xl
                                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white
                                 border-b border-slate-200 dark:border-slate-700 pb-2">
                    Informations
                  </h2>

                  <Info label="Nom"               value={category.name} />
                  <Info label="Slug"              value={category.slug} />
                  <Info label="Statut" value={
                    isDeleted
                      ? <Badge color="red">Désactivée</Badge>
                      : <Badge color="green">Active</Badge>
                  } />
                  <Info label="Produits associés" value={category.products.length} />
                  <Info label="Créée le"          value={formatDate(category.created_at)} />
                  <Info label="Modifiée le"       value={formatDate(category.updated_at)} />

                  {isDeleted && (
                    <div className="mt-6 p-4 rounded-lg border
                                    bg-red-50 border-red-100 dark:bg-red-900/30 dark:border-red-600/40">
                      <h3 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                        Catégorie désactivée
                      </h3>
                      <p className="text-sm text-red-700 dark:text-red-200">
                        Cette catégorie a été supprimée et n'est plus visible publiquement.
                      </p>
                    </div>
                  )}
                </section>

                {/* --- Informations système (inchangé) --- */}
                <section className="mt-6 h-fit rounded-xl border border-slate-200 bg-white shadow-xl
                                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white
                                 border-b border-slate-200 dark:border-slate-700 pb-2">
                    Informations système
                  </h2>
                  <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
                    <SysInfo icon={Hash}     label="ID"       content={category.id} />
                    <SysInfo icon={Tag}      label="Slug"     content={category.slug} />
                    <SysInfo icon={Calendar} label="Créée"    content={formatDate(category.created_at)} />
                    <SysInfo icon={Clock}    label="Modifiée" content={formatDate(category.updated_at)} />
                  </div>
                </section>
              </div>

              {/* ----- Col 2-3 : Produits ----- */}
              <div className="lg:col-span-2">
                <section className="h-fit rounded-xl border border-slate-200 bg-white shadow-xl
                                    dark:bg-white/5 dark:border-slate-700 backdrop-blur-md p-6">
                  <h2 className="text-lg font-medium mb-4 text-slate-900 dark:text-white
                                 border-b border-slate-200 dark:border-slate-700 pb-2">
                    Produits associés
                  </h2>

                  {category.products.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                      <p className="text-slate-500 dark:text-slate-400 text-lg font-medium mb-2">
                        Aucun produit associé
                      </p>
                      <p className="text-slate-400 dark:text-slate-500 text-sm">
                        Cette catégorie ne contient aucun produit pour le moment.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {category.products.map((p) => {
                        const secondary = [
                          p.model ?? null,
                          p.brand ?? null,
                        ].filter(Boolean).join(' – ');

                        const initial = (p.name || '•')[0]?.toUpperCase();

                        return (
                          <Link key={p.id} href={`/products/${p.id}`} className="block group">
                            <article
                              className="p-4 rounded-lg border border-slate-200 dark:border-slate-600
                                         bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100
                                         dark:hover:bg-slate-700/50 transition-all duration-200
                                         hover:shadow-md cursor-pointer">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600
                                                flex items-center justify-center text-white font-medium text-sm">
                                  {initial}
                                </div>
                                <div className="flex-1 min-w-0">
                                  {/* Nom du produit */}
                                  <h3 className="font-medium text-slate-900 dark:text-white truncate
                                                 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {p.name}
                                  </h3>
                                  {/* Modèle – Marque */}
                                  {secondary && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                      {secondary}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </article>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </section>
              </div>

            </div>
          </div>
        </AppLayout>
      </div>
    </>
  );
}

/* ---------- Sous-composants ---------- */
function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</h3>
      <p  className="mt-1 text-sm font-medium text-slate-800 dark:text-white">{value}</p>
    </div>
  );
}

function Badge({ children, color = 'gray' }: {
  children: React.ReactNode;
  color?: 'gray' | 'green' | 'red';
}) {
  const styles = {
    gray:  'bg-slate-100 text-slate-800 dark:bg-slate-700/40 dark:text-slate-200',
    green: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    red:   'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  } as const;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[color]}`}>
      {children}
    </span>
  );
}

function SysInfo({ icon: Icon, label, content }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  content: React.ReactNode;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Icon className="w-4 h-4 text-slate-400" />
      <span>{label}: {content}</span>
    </div>
  );
}
