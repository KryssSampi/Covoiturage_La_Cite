'use client'

import { useAppState, Language } from '@/core/state/app_state'
import { ToggleLangButton } from '@/shared/ui/buttons/togglelang'
import { MainLogo } from '@/shared/ui/logo/main_logo'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useActiveNav } from '../hooks/useActiveNav'
import { useNavLinks } from '../hooks/useNavLinks'
import { useIsMobileOrTablet } from '@/shared/hooks/useismobileortable'
import { useLoader } from '@/core/context/loader.context'
import { useRouter } from 'next/navigation'

// Titres des pages publiques secondaires (hors homepage)
const PUBLIC_PAGE_LABELS: Record<string, { fr: string; en: string }> = {
  '/about':              { fr: 'À propos',          en: 'About'           },
  '/contact':            { fr: 'Contact',            en: 'Contact'         },
  '/comment-ca-marche':  { fr: 'Comment ça marche', en: 'How it works'    },
  '/conditions':         { fr: 'Conditions',         en: 'Terms'           },
  '/confidentialite':    { fr: 'Confidentialité',    en: 'Privacy'         },
  '/accessibilite':      { fr: 'Accessibilité',      en: 'Accessibility'   },
  '/securite':           { fr: 'Sécurité',           en: 'Safety'          },
  '/faq':                { fr: 'FAQ',                en: 'FAQ'             },
  '/maintenance':        { fr: 'Maintenance',        en: 'Maintenance'     },
}

export function Header() {
  const appState = useAppState()
  const { setActiveLoader } = useLoader();
  const router = useRouter();
  const isbellowlg = useIsMobileOrTablet();

  const { activePath, setActive } = useActiveNav()
  const { mainLinks, getLabel } = useNavLinks()

  const isFR = appState.lang === Language.FR
  const currentPublicPage = PUBLIC_PAGE_LABELS[activePath] ?? null

  return (
    <header className="bg-blue-800 shadow-md sticky top-0 z-50">
      <nav className="container mx-auto lg:px-4 lg:py-0 flex justify-between items-center">
        <MainLogo />

        <div className="flex items-center">
          {/* Groupe Navigation Principale */}
          <div className="flex lg:mr-6 relative items-center">
   
            { isbellowlg ? (
              <Link href="/" className="py-2 ml-10 text-2xs lg:px-2 lg:py-2 justify-center items-center lg:text-lg font-semibold transition-colors duration-300 text-white hover:text-blue-200">
                {isFR ? 'Accueil' : 'Home'}
              </Link>
            ) : (mainLinks.map((link) => {
              const isActive = activePath === link.href

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setActive(link.href)}
                  className={`relative text-2xs lg:px-2 lg:py-2 lg:text-lg font-semibold transition-colors duration-300 
                    ${isActive ? 'text-blue-200' : 'text-white hover:text-blue-200'}`}
                >
                  {getLabel(link, appState.lang)}

                  {/* LA BARRE MAGNÉTIQUE */}
                  {isActive && (
                    <motion.div
                      layoutId="active-pill"
                      className="absolute bottom-0 left-0 right-0 h-1 bg-blue-300 rounded-full"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              )
            }))}

            {/* Séparateur + FAQ */}
            <div className="relative group flex items-center ml-2">
              <Link
                href="/faq"
                className={`px-3 py-2 text-2xs lg:px-3 lg:py-2 lg:text-lg font-semibold transition-colors relative ${
                  activePath === '/faq' ? 'text-blue-200' : 'text-white hover:text-blue-200'
                }`}
              >
                FAQ
                {activePath === '/faq' && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-blue-300 rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </div>

            {/* Titre de la page publique active (hors homepage) */}
            {currentPublicPage && activePath !== '/faq' && (
              <>
                <div className="hidden lg:block w-px h-5 bg-white/30 mx-2" />
                <span className="hidden lg:inline-flex relative text-sm lg:text-base font-semibold px-2 py-1 text-blue-200">
                  {isFR ? currentPublicPage.fr : currentPublicPage.en}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-300 rounded-full" />
                </span>
              </>
            )}
          </div>

          <div className="bg-white/20 w-px h-8 lg:mx-4" />

          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-2 ${isbellowlg ? ' mr-15' : ''}`}>
            <ToggleLangButton  />
            </div>
            <button
            onClick={() => {
              if (!appState.userConnected) {
                setActiveLoader(true);
                router.push('/login');
              } else {
                router.push(`/${appState.userConnected.role.toString().toLowerCase()}/${appState.userConnected.id}`);
              }
            }}
              className={`bg-white text-blue-800 ${isbellowlg ? '-ml-17 w-20' : 'w-full'} py-2 rounded-full text-xs lg:px-6 lg:py-2 lg:text-lg font-semibold 
                         transition-all duration-300 lg:hover:bg-blue-50 lg:hover:shadow-lg lg:hover:scale-105
                         active:scale-95`}
            >
              {isFR ? 'Se connecter' : 'Sign in'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}