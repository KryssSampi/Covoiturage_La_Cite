/**
 * @file header.types.ts
 * @description Types et factories de liens du Header.
 *
 * Les liens contenant le rôle/id sont générés via des fonctions (buildNavItems,
 * buildMenuItems, etc.) appelées dans useHeader à chaque render — jamais au niveau
 * module. Cela évite le bug classique où les hrefs sont figés à la valeur de
 * l'utilisateur présent lors du premier import du module.
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NavItem {
  labelFR:           string;
  labelEN:           string;
  href:              string;
  isDriverOnly?:     boolean;
  isPassengerOnly?:  boolean;
  /**
   * Si true : affiché dans la barre de nav sur desktop (md+).
   * Sur mobile, il passe dans le menu burger.
   */
  desktopOnly?:      boolean;
}

// ─── Factories réactives ─────────────────────────────────────────────────────
// Chaque fonction reçoit role + id en paramètre et retourne un nouveau tableau.
// Appelées depuis useHeader (niveau hook) → toujours synchronisées avec
// l'utilisateur courant.

export function buildNavItems(role: string, id: string): NavItem[] {
  return [
    { labelFR: "Accueil",    labelEN: "Home",             href: `/${role}/${id}`                      },
    { labelFR: "Planifier",  labelEN: "Plan",             href: `/${role}/planifier/${id}`,    desktopOnly: true },
    { labelFR: "Demandes",   labelEN: "Bookings Requests",href: `/${role}/reservations/${id}`, desktopOnly: true },
    { labelFR: "Historique", labelEN: "History",          href: `/${role}/historique/${id}`,   desktopOnly: true },
    { labelFR: "FAQ",        labelEN: "FAQ",              href: `/faq`,                        desktopOnly: true },
  ];
}

export function buildMenuItems(role: string, id: string): NavItem[] {
  return [
    { labelFR: "Planifier",      labelEN: "Plan",             href: `/${role}/planifier/${id}`         },
    { labelFR: "Historique",     labelEN: "History",          href: `/${role}/historique/${id}`        },
    { labelFR: "Demandes",       labelEN: "Bookings Requests",href: `/${role}/reservations/${id}`      },
    { labelFR: "Statistiques",   labelEN: "Statistics",       href: `/${role}/statistiques/${id}`      },
    { labelFR: "Finances",       labelEN: "Finances",         href: `/${role}/finances/${id}`          },
    { labelFR: "Mes Brouillons", labelEN: "Drafts",           href: `/driver/brouillons/${id}`,  isDriverOnly: true },
    { labelFR: "Mes Favoris",    labelEN: "My Favorites",     href: `/${role}/favoris/${id}`           },
    { labelFR: "Avis sur moi",   labelEN: "Reviews",          href: `/${role}/reviews/${id}`           },
    { labelFR: "Nouveautés",     labelEN: "New Features",     href: `/${role}/nouveautes/${id}`        },
    { labelFR: "Go Board",       labelEN: "Go Board",         href: `/${role}/goboard/${id}`           },
    { labelFR: "FAQ",            labelEN: "FAQ",              href: `/faq`                             },
  ];
}

export function buildAvatarMenuItems(role: string, id: string): NavItem[] {
  return [
    { labelFR: "Profil",      labelEN: "Profile",   href: `/profile/settings`          },
    { labelFR: "Paramètres",  labelEN: "Settings",  href: `/${role}/settings/${id}` },
  ];
}

export function buildExtraPageTitles(role: string, id: string): NavItem[] {
  return [
    { labelFR: "Recherche",        labelEN: "Search",         href: `/${role}/search/${id}`     },
    { labelFR: "Nouveau trajet",   labelEN: "New Trip",       href: `/driver/create-trip/${id}` },
    { labelFR: "Détail du trajet", labelEN: "Trip Details",   href: `/trajets`                  },
    { labelFR: "Notifications",    labelEN: "Notifications",  href: `/notifications`            },
    { labelFR: "Trajet en cours",  labelEN: "Ongoing Trip",   href: `/trajet-en-cours`          },
    // ── Pages publiques ──────────────────────────────────────────────────
    { labelFR: "À propos",          labelEN: "About",          href: "/about"             },
    { labelFR: "Contact",            labelEN: "Contact",        href: "/contact"           },
    { labelFR: "Comment ça marche", labelEN: "How it works",   href: "/comment-ca-marche" },
    { labelFR: "Sécurité",          labelEN: "Safety",         href: "/securite"          },
    { labelFR: "CGU",               labelEN: "Terms",          href: "/conditions"        },
    { labelFR: "Confidentialité",   labelEN: "Privacy",        href: "/confidentialite"   },
    { labelFR: "Accessibilité",     labelEN: "Accessibility",  href: "/accessibilite"     },
    { labelFR: "Maintenance",       labelEN: "Maintenance",    href: "/maintenance"       },
  ];
}
