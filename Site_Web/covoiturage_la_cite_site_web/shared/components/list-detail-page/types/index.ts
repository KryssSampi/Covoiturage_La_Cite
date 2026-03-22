// Types publics du composant ListDetailPage<T>

/** Une option de filtre dans le dropdown */
export interface FilterOption {
  /** Valeur unique utilisée en interne */
  value: string;
  /** Label affiché dans le dropdown */
  label: string;
}

/** Un groupe de filtres (section dans le dropdown) */
export interface FilterGroup {
  /** Titre de la section ex: "Statut" */
  title: string;
  /** Clé de la propriété de l'item sur laquelle filtrer */
  field: string;
  options: FilterOption[];
}

/** Une option de tri */
export interface SortOption {
  value: string;
  label: string;
  /** Fonction de comparaison */
  compareFn: <T>(a: T, b: T) => number;
}

/** Action du bouton CTA quand la liste est vide */
export interface EmptyAction {
  label: string;
  onClick: () => void;
}

/** Props du composant générique */
export interface ListDetailPageProps<T extends { id: string | number }> {
  /** Données à afficher */
  items: T[];

  /** Rendu d'une carte dans la liste */
  renderCard: (item: T, isSelected: boolean) => React.ReactNode;

  /** Rendu du panneau détail (overview) */
  renderDetail?: (item: T) => React.ReactNode;

  /** Groupes de filtres */
  filterGroups?: FilterGroup[];

  /** Options de tri */
  sortOptions?: SortOption[];

  /**
   * Clés de l'objet à inclure dans la recherche textuelle.
   * Accepte la notation pointée ex: "driver.firstName"
   * Si non fourni, recherche sur toutes les propriétés string/number
   */
  searchKeys?: string[];

  /**
   * Afficher le panneau overview à droite.
   * Si false, le clic sur une carte appelle onCardClick (redirect).
   * @default true
   */
  withOverview?: boolean;

  /** Appelé au clic sur une carte quand withOverview=false */
  onCardClick?: (item: T) => void;

  /** Message affiché quand la liste est vide (aucune donnée) */
  emptyMessage?: string;

  /** CTA quand la liste est vide */
  emptyAction?: EmptyAction;

  /** État de chargement */
  isLoading?: boolean;

  /** Nombre de skeletons affichés en chargement @default 4 */
  skeletonCount?: number;

  /**
   * Clé du paramètre URL reflétant l'item sélectionné.
   * Ex : "notificationid", "reservationid", "brouillonid".
   * Quand fourni, la sélection est synchronisée avec l'URL.
   */
  itemParamKey?: string;
}
