import { Language } from '@/core/state/app_state'
import { getHomepageNavLinks, getLocalizedNavLinkLabel, type NavLink } from '@/core/services/homepage-content.service'

export function useNavLinks() {
  const mainLinks: NavLink[] = getHomepageNavLinks()

  const getLabel = (link: NavLink, lang: Language): string => {
    return getLocalizedNavLinkLabel(link, lang)
  }

  return {
    mainLinks,
    getLabel,
  }
}
