import { DivideIcon as LucideIcon } from 'lucide-react'
import type { Config } from 'ziggy-js'

/* ---------- Navigation / Layout --------------------------------- */
export interface BreadcrumbItem { title: string; href: string }
export interface NavItem   {
  title: string
  href?: string
  icon?: LucideIcon | null
  isActive?: boolean
  children?: NavItem[]
}
export interface NavGroup { title: string; items: NavItem[] }

/* ---------- TaxRates -------------------------------------------- */
export interface TaxRate {
  id: number
  name: string
  rate: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/* ---------- Currencies ------------------------------------------ */
export interface Currency {
  id: number
  name: string
  code: string          // ex : EUR, USD
  symbol: string        // ex : €, $
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
}

/* ---------- Auth / Utilisateur ---------------------------------- */
export interface User {
  id: number
  name: string
  email: string
  avatar?: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  roles: { name: string }[]
  [key: string]: unknown
}
export interface Auth { user: User }

/* ---------- Données partagées Inertia --------------------------- */
export interface SharedData {
  name: string
  quote: { message: string; author: string }
  auth: Auth
  ziggy: Config & { location: string }
  sidebarOpen: boolean
  [key: string]: any
}
export type PageProps<T = unknown> = SharedData & T

/* ---------- Catalogue ------------------------------------------- */
export interface Category {
  id: number
  name: string
  slug: string
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
  products?: Array<{
    id: number
    name: string
  }>
}

export interface AppSettings {
  app_name: string
  app_slogan?: string
  logo_path?: string
  logo_dark_path?: string
  favicon_path?: string
  primary_color?: string
  secondary_color?: string
  contact_email?: string
  contact_phone?: string
  contact_address?: string
  cgu_url?: string
  privacy_url?: string
  copyright?: string
  social_links?: string[] | null
  meta_keywords?: string
  meta_description?: string

  // URLs calculées côté backend
  logo_url?: string
  logo_dark_url?: string
  favicon_url?: string
}

export interface ProductImage {
  id: number
  product_id: string
  path: string
  is_primary: boolean
  deleted_at?: string | null
  created_at?: string
  updated_at?: string
}

/* --- Compatibilités -------------------------------------------- */
export interface ProductCompatibilityPivot {
  direction: 'bidirectional' | 'uni'
  note: string | null
}

export interface CompatibilityItem {
  id: string
  name: string
  direction: 'bidirectional' | 'uni'
  note: string | null
}

export interface CompatibilityEntry {
  compatible_with_id: string
  direction?: 'bidirectional' | 'uni'
  note?: string
}

/* --- Produit principal ----------------------------------------- */
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  brand?: {
    id: string;
    name: string;
  };
  currency?: {
    code: string;
    symbol: string;
  };
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  /* relations éventuellement chargées */
  compatible_with?: Array<{
    id: string
    name: string
    pivot: ProductCompatibilityPivot
  }>
  is_compatible_with?: Array<{
    id: string
    name: string
    pivot: ProductCompatibilityPivot
  }>

  /* spécialisations dynamiques (ram, processor, …) */
  [key: string]: unknown
}

export interface Pagination<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/* --- Filtres pour les produits --------------------------------- */
export interface ProductFilterType {
  field: 'search' | 'name' | 'category' | 'status' | 'price' | 'stock' | 'date';
  value: string;
  value2?: string; // Pour les filtres "between" et "date_range"
  operator: 'contains' | 'equals' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'date_range';
}

export interface ProductFilters {
  search?: string;
  name?: string;
  category?: string;
  status?: string;
  price?: string;
  price_operator?: string;
  price_min?: string;
  price_max?: string;
  stock?: string;
  stock_operator?: string;
  stock_min?: string;
  stock_max?: string;
  date_start?: string;
  date_end?: string;
}
