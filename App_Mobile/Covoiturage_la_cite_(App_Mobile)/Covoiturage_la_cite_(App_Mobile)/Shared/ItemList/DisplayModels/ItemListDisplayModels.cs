// Shared/ItemList/DisplayModels/ItemListDisplayModels.cs
// ════════════════════════════════════════════════════════════════════════
// Modèles de configuration du composant ItemList générique.
// ════════════════════════════════════════════════════════════════════════

namespace Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels;

// ─── Filtre ──────────────────────────────────────────────────────────────────

/// <summary>
/// Définit un filtre disponible dans le menu contextuel.
/// La fonction Predicate&lt;T&gt; est appliquée sur chaque item de la liste.
/// </summary>
public class ListFilter<T>
{
    public required string   Id        { get; init; }
    public required string   Label     { get; init; }
    public bool              IsDefault  { get; init; } = false;
    public bool              IsActive  { get; set; } = false;
    public required Func<T, bool> Predicate { get; init; }
}

/// <summary>
/// Groupe de filtres affiché dans le menu contextuel (section avec titre optionnel).
/// </summary>
public class ListFilterGroup<T>
{
    public string?                    GroupLabel { get; init; }  // null = pas de titre
    public bool              IsDefault  { get; init; } = false;
    public required IList<ListFilter<T>> Filters   { get; init; }
}

// ─── Tri ─────────────────────────────────────────────────────────────────────

/// <summary>
/// Option de tri disponible dans le menu contextuel.
/// </summary>
public class ListSort<T>
{
    public required string   Id         { get; init; }
    public required string   Label      { get; init; }
    public bool              IsDefault  { get; init; } = false;
    public bool              IsActive   { get; set; } = false;
    public required Func<IEnumerable<T>, IEnumerable<T>> Sorter { get; init; }
}

// ─── Onglets ─────────────────────────────────────────────────────────────────

/// <summary>
/// Onglet optionnel du composant ItemList.
/// Quand la liste en a plusieurs, une barre d'onglets s'affiche en tête.
/// La propriété Predicate filtre les items selon le rôle / la catégorie.
/// </summary>
public class ItemListTab<T>
{
    public required string                  Label     { get; init; }
    public required Func<T, bool>          Predicate { get; init; }
}

// ─── Configuration globale ───────────────────────────────────────────────────

/// <summary>
/// Configuration complète passée au composant ItemList.
/// T = type des items de la liste (ex: TripSearchResultCardDisplayModel).
/// </summary>
public class ItemListConfig<T> where T : class
{
    /// <summary>Placeholder de la barre de recherche.</summary>
    public string SearchPlaceholder { get; init; } = "Rechercher…";

    /// <summary>
    /// Propriétés string extraites de chaque item pour la recherche plein texte.
    /// Ex: item => new[] { item.DriverName, item.Route.FromLabel }
    /// </summary>
    public required Func<T, IEnumerable<string>> SearchFields { get; init; }

    /// <summary>Groupes de filtres (menu contextuel multi-sélection).</summary>
    public IReadOnlyList<ListFilterGroup<T>> FilterGroups { get; init; }
        = Array.Empty<ListFilterGroup<T>>();

    /// <summary>Options de tri (menu contextuel sélection unique).</summary>
    public IReadOnlyList<ListSort<T>> SortOptions { get; init; }
        = Array.Empty<ListSort<T>>();

    /// <summary>Source complète des items (avant filtrage/tri).</summary>
    public required IReadOnlyList<T> Items { get; init; }

    /// <summary>Afficher l'état "Pas de connexion" (piloté par la feature).</summary>
    public bool ShowNoInternet { get; init; } = false;

    /// <summary>Texte de l'état vide.</summary>
    public string EmptyStateTitle    { get; init; } = "Aucun résultat";
    public string EmptyStateSubtitle { get; init; } = "Modifiez vos critères de recherche.";

    /// <summary>Icône Fluent pour l'état vide (glyph Unicode).</summary>
    public string EmptyStateIconGlyph   { get; init; } = "\uF1EB";  // Search
    public string NoInternetIconGlyph   { get; init; } = "\uF4CB";  // WiFi off
    public string NoInternetTitle       { get; init; } = "Pas de connexion";
    public string NoInternetSubtitle    { get; init; } = "Vérifiez votre connexion internet.";

    /// <summary>
    /// Onglets optionnels (max 2). Si vide, aucune barre d'onglets n'est affichée.
    /// Quand des onglets sont définis, seuls les items correspondant au prédicat de
    /// l'onglet actif sont affichés (AVANT la recherche/filtres).
    /// </summary>
    public IReadOnlyList<ItemListTab<T>> Tabs { get; init; } = Array.Empty<ItemListTab<T>>();
}

