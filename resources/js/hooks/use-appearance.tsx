// resources/js/hooks/use-appearance.ts
import { useCallback, useEffect, useState } from 'react'

export type Appearance = 'light' | 'dark' | 'system'

const prefersDark = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-color-scheme: dark)').matches

const applyTheme = (appearance: Appearance) => {
  const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark())
  document.documentElement.classList.toggle('dark', isDark)
}

export function initializeTheme() {
  const saved = (localStorage.getItem('appearance') as Appearance) || 'system'
  applyTheme(saved)
}

export function useAppearance() {
  // 👉 toujours basé sur la classe <html>
  const getIsDark = () =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('dark')

  const [appearance, setAppearance] = useState<Appearance>(
    (localStorage.getItem('appearance') as Appearance) || 'system'
  )
  const [isDark, setIsDark] = useState<boolean>(getIsDark)

  const updateAppearance = useCallback((mode: Appearance) => {
    setAppearance(mode)
    localStorage.setItem('appearance', mode)
    applyTheme(mode)                 // ⬅️ ajoute/retire la classe dark
    setIsDark(getIsDark())           // ⬅️ met à jour TOUT DE SUITE pour ce composant
  }, [])

  useEffect(() => {
    // 1. thème sauvegardé au chargement
    applyTheme(appearance)
    setIsDark(getIsDark())

    // 2. observe les changements de classe sur <html>
    const observer = new MutationObserver(() => {
      setIsDark(getIsDark())         // ⬅️ met à jour TOUS les autres composants
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [appearance])

  return { appearance, updateAppearance, isDark } as const
}
