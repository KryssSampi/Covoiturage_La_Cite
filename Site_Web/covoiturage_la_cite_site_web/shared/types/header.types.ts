/**
 * @file header.types.ts
 * @description Types et constantes statiques du Header.
 *
 * Centralisé ici pour éviter toute logique dans le composant
 * et faciliter l'ajout ou la modification de liens sans toucher au JSX.
 */

import { getUserConnected } from "@/core/state/app_state";

const user = getUserConnected();

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NavItem {
  labelFR: string;
  labelEN: string;
  href: string;

  isDriverOnly?: boolean; // Affiché uniquement pour les conducteurs
  isPassengerOnly?: boolean; // Affiché uniquement pour les passagers
  /**
   * Si true : affiché dans la barre de nav sur desktop (md+).
   * Sur mobile, il passe automatiquement dans le menu burger.
   */
  desktopOnly?: boolean;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

/**
 * Liens visibles dans la barre de navigation principale.
 *
 * `__dashboard__` est un alias résolu dynamiquement dans useHeader
 * vers `/{role}/{userId}` selon l'utilisateur connecté.
 *
 * `desktopOnly: true` → visible dans la barre sur desktop,
 * masqué sur mobile (disponible dans le burger).
 */

const role = user?.role.toLowerCase()
const id   = user?.id

/**
 * Liens affichés dans la barre de navigation principale.
 * Règle : /{role}/{page}/{ressource}/{id} — max 4 segments, ID toujours en bout
 */
export const NAV_ITEMS: NavItem[] = [
  { labelFR: "Accueil",               labelEN: "Home",             href: `/${role}/${id}`                        },
  { labelFR: "Planifier",             labelEN: "Plan",             href: `/${role}/planifier/${id}`,             desktopOnly: true },
  { labelFR: "Demandes",              labelEN: "Bookings Requests",href: `/${role}/reservations/${id}`,          desktopOnly: true },
  { labelFR: "Historique",            labelEN: "History",          href: `/${role}/historique/${id}`,            desktopOnly: true },
  { labelFR: "FAQ",                   labelEN: "FAQ",              href: `/faq`,                                 desktopOnly: true },
]

/**
 * Liens affichés dans le menu burger.
 * Sur mobile, tous ces liens y apparaissent.
 * Sur desktop, seuls ceux qui ne sont pas déjà dans la barre principale y figurent.
 */
export const MENU_ITEMS: NavItem[] = [
  { labelFR: "Planifier",             labelEN: "Plan",             href: `/${role}/planifier/${id}`              },
  { labelFR: "Historique",            labelEN: "History",          href: `/${role}/historique/${id}`             },
  { labelFR: "Demandes",              labelEN: "Bookings Requests",href: `/${role}/reservations/${id}`           },
  {labelFR: "Statistiques",           labelEN: "Statics",          href: `/${role}/statistiques/${id}`           },
   {labelFR: "Finances",              labelEN: "Finances",         href: `/${role}/finances/${id}`              },
    {labelFR: "Mes Brouillons",            labelEN: "Drafts trips",           href: `/driver/brouillons/${id}`   , isDriverOnly: true },       
   { labelFR: "Mes Favoris",           labelEN: "My Favorites",     href: `/${role}/favoris/${id}`                },
  { labelFR: "Avis sur moi",          labelEN: "Reviews",          href: `/${role}/reviews/${id}`                },
  { labelFR: "Nouveautés",            labelEN: "New Features",     href: `/${role}/nouveautes/${id}`             },
  { labelFR: "Go Board",              labelEN: "Go Board",         href: `/${role}/goboard/${id}`                },
  { labelFR: "FAQ",                   labelEN: "FAQ",              href: `/faq`                                  },
]

/**
 * Liens affichés dans le dropdown de l'avatar.
 * Profil = ressource publique → (public)/profile
 * Paramètres = protégé → /{role}/settings
 */
export const AVATAR_MENU_ITEMS: NavItem[] = [
  { labelFR: "Profil",                labelEN: "Profile",          href: `/profile/${id}`                        },
  { labelFR: "Paramètres",            labelEN: "Settings",         href: `/${role}/settings/${id}`               },
]

/**
 * Pages supplémentaires non présentes dans la navigation principale ni le burger.
 * Utilisé par le Header pour afficher le titre de la page active
 * lorsqu'elle n'est pas déjà visible dans la barre de navigation.
 */
export const EXTRA_PAGE_TITLES: NavItem[] = [
  { labelFR: "Recherche",             labelEN: "Search",           href: `/${role}/search/${id}`                 },
  { labelFR: "Nouveau trajet",        labelEN: "New Trip",         href: `/driver/create-trip/${id}`             },
  { labelFR: "Détail du trajet",      labelEN: "Trip Details",     href: `/trajets`                              },
  { labelFR: "Notifications",         labelEN: "Notifications",    href: `/notifications`                        },
  { labelFR: "Trajet en cours",       labelEN: "Ongoing Trip",     href: `/trajet-en-cours`                      },
]