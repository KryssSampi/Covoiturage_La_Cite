import { Language } from '@/core/state/app_state'

interface NavLink {
  href: string
  fr: string
  en: string
}

/**
 * Hook pour gérer les liens de navigation
 * Retourne les liens principaux en fonction de la langue
 */
export function useNavLinks() {
  const mainLinks: NavLink[] = [
    { href: '/', fr: 'Accueil', en: 'Home' },
    { 
      href: '/#pourquoi-nous-choisir', 
      fr: 'Pourquoi Nous Choisir ?', 
      en: 'Why choose us ?' 
    },
    { 
      href: '/#comment-ca-marche', 
      fr: 'Comment Ça Marche ?', 
      en: 'How it Works ?' 
    },
  ]

  const getLabel = (link: NavLink, lang: Language): string => {
    return lang === Language.FR ? link.fr : link.en
  }

  return {
    mainLinks,
    getLabel,
  }
}
