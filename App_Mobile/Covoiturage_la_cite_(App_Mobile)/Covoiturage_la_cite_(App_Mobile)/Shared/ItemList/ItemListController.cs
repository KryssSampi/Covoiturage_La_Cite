// Shared/ItemList/ItemListController.cs
// ════════════════════════════════════════════════════════════════════════
// Contrôleur générique du composant ItemList.
// Gère : recherche plein-texte, filtres multi-sélection, tri unique,
//        état vide, état no-internet, filtres actifs (chips).
// ════════════════════════════════════════════════════════════════════════

using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Shared.ItemList.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Shared.ItemList;

public class ItemListController<T> : INotifyPropertyChanged where T : class
{
    private readonly ItemListConfig<T> _config;
    private List<T> _sourceItems = new();

    // ── État interne ────────────────────────────────────────────────────
    private string _searchText = "";
    private bool   _isFilterMenuOpen = false;
    private bool   _isSortMenuOpen   = false;

    // ── Propriétés publiques ────────────────────────────────────────────

    /// <summary>Texte de recherche courant.</summary>
    public string SearchText
    {
        get => _searchText;
        set { if (Set(ref _searchText, value)) ApplyAll(); }
    }

    /// <summary>Items filtrés/triés affichés dans la liste.</summary>
    private IReadOnlyList<T> _displayedItems = Array.Empty<T>();
    public IReadOnlyList<T> DisplayedItems
    {
        get => _displayedItems;
        private set => Set(ref _displayedItems, value);
    }

    /// <summary>Chips des filtres actifs (filtre + tri).</summary>
    private IReadOnlyList<ActiveChip> _activeChips = Array.Empty<ActiveChip>();
    public IReadOnlyList<ActiveChip> ActiveChips
    {
        get => _activeChips;
        private set => Set(ref _activeChips, value);
    }

    /// <summary>Filtres disponibles (liés au menu contextuel).</summary>
    public IReadOnlyList<ListFilterGroup<T>> FilterGroups => _config.FilterGroups;

    /// <summary>Options de tri disponibles.</summary>
    public IReadOnlyList<ListSort<T>> SortOptions => _config.SortOptions;

    /// <summary>Option de tri actuellement sélectionnée.</summary>
    public ListSort<T>? ActiveSort { get; private set; }

    public bool HasActiveFiltersOrSort => _activeChips.Count > 0;
    public bool IsFilterMenuOpen { get => _isFilterMenuOpen; set => Set(ref _isFilterMenuOpen, value); }
    public bool IsSortMenuOpen   { get => _isSortMenuOpen;   set => Set(ref _isSortMenuOpen,   value); }

    public bool ShowNoInternet  => _config.ShowNoInternet;
    public bool ShowEmpty       => !ShowNoInternet && _displayedItems.Count == 0;
    public bool ShowList        => !ShowNoInternet && _displayedItems.Count > 0;

    // Config exposée pour les états vides
    public string SearchPlaceholder   => _config.SearchPlaceholder;
    public string EmptyTitle          => _config.EmptyStateTitle;
    public string EmptySubtitle       => _config.EmptyStateSubtitle;
    public string EmptyIconGlyph      => _config.EmptyStateIconGlyph;
    public string NoInternetTitle     => _config.NoInternetTitle;
    public string NoInternetSubtitle  => _config.NoInternetSubtitle;
    public string NoInternetIconGlyph => _config.NoInternetIconGlyph;

    // ── Commandes ───────────────────────────────────────────────────────

    public ICommand ToggleFilterMenuCommand { get; }
    public ICommand ToggleSortMenuCommand   { get; }
    public ICommand ToggleFilterCommand     { get; }   // param: ListFilter<T>
    public ICommand SelectSortCommand       { get; }   // param: ListSort<T>
    public ICommand RemoveChipCommand       { get; }   // param: ActiveChip
    public ICommand ClearAllCommand         { get; }

    // ── Constructeur ────────────────────────────────────────────────────

    public ItemListController(ItemListConfig<T> config)
    {
        _config = config;
        _sourceItems = _config.Items.ToList();

        ToggleFilterMenuCommand = new Command(() =>
        {
            IsFilterMenuOpen = !IsFilterMenuOpen;
            if (IsFilterMenuOpen) IsSortMenuOpen = false;
        });

        ToggleSortMenuCommand = new Command(() =>
        {
            IsSortMenuOpen = !IsSortMenuOpen;
            if (IsSortMenuOpen) IsFilterMenuOpen = false;
        });

        ToggleFilterCommand = new Command<ListFilter<T>>(filter =>
        {
            if (filter == null) return;
            filter.IsActive = !filter.IsActive;
            ApplyAll();
        });

        SelectSortCommand = new Command<ListSort<T>>(sort =>
        {
            if (sort == null) return;
            // Désactive l'ancien tri
            if (ActiveSort != null) ActiveSort.IsActive = false;
            // Active le nouveau ou désactive si c'était le même
            if (ActiveSort?.Id == sort.Id)
            {
                ActiveSort = null;
            }
            else
            {
                sort.IsActive = true;
                ActiveSort = sort;
            }
            IsSortMenuOpen = false;
            ApplyAll();
        });

        RemoveChipCommand = new Command<ActiveChip>(chip =>
        {
            if (chip == null) return;
            if (chip.IsSortChip)
            {
                if (ActiveSort != null) ActiveSort.IsActive = false;
                ActiveSort = null;
            }
            else
            {
                var filter = FindFilterById(chip.Id);
                if (filter != null) filter.IsActive = false;
            }
            ApplyAll();
        });

        ClearAllCommand = new Command(() =>
        {
            foreach (var group in _config.FilterGroups)
                foreach (var f in group.Filters)
                    f.IsActive = false;
            if (ActiveSort != null) ActiveSort.IsActive = false;
            ActiveSort = null;
            ApplyAll();
        });

        // Chargement initial
        ApplyAll();
    }

    // ── Moteur de filtrage / tri ────────────────────────────────────────

    /// <summary>Met a jour la source d'items (ex: apres chargement API).</summary>
    public void UpdateSource(IEnumerable<T> items)
    {
        _sourceItems = items?.ToList() ?? new List<T>();
        ApplyAll();
    }

    private void ApplyAll()
    {
        var query = _sourceItems.AsEnumerable();

        // 1. Recherche plein-texte
        var search = SearchText.Trim().ToLowerInvariant();
        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(item =>
                _config.SearchFields(item)
                       .Any(f => f != null &&
                                 f.Contains(search, StringComparison.OrdinalIgnoreCase)));
        }

        // 2. Filtres actifs (AND entre groupes, OR dans un groupe)
        foreach (var group in _config.FilterGroups)
        {
            var activeInGroup = group.Filters.Where(f => f.IsActive).ToList();
            if (activeInGroup.Count > 0)
                query = query.Where(item => activeInGroup.Any(f => f.Predicate(item)));
        }

        // 3. Tri
        if (ActiveSort != null)
            query = ActiveSort.Sorter(query);

        // Assignation en bloc → 1 seule notification PropertyChanged au lieu de N+1
        DisplayedItems = query.ToList();

        // Chips filtres actifs
        ActiveChips = BuildChipsList();

        OnPropertyChanged(nameof(HasActiveFiltersOrSort));
        OnPropertyChanged(nameof(ShowEmpty));
        OnPropertyChanged(nameof(ShowList));
        OnPropertyChanged(nameof(ShowNoInternet));
    }

    private IReadOnlyList<ActiveChip> BuildChipsList()
    {
        var chips = new List<ActiveChip>();

        if (ActiveSort != null)
            chips.Add(new ActiveChip(ActiveSort.Id, ActiveSort.Label, IsSortChip: true));

        foreach (var group in _config.FilterGroups)
            foreach (var filter in group.Filters.Where(f => f.IsActive))
                chips.Add(new ActiveChip(filter.Id, filter.Label, IsSortChip: false));

        return chips;
    }

    private ListFilter<T>? FindFilterById(string id)
    {
        foreach (var group in _config.FilterGroups)
        {
            var f = group.Filters.FirstOrDefault(f => f.Id == id);
            if (f != null) return f;
        }
        return null;
    }

    // ── INotifyPropertyChanged ──────────────────────────────────────────

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string? n = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(n));
    private bool Set<TVal>(ref TVal f, TVal v, [CallerMemberName] string? n = null)
    {
        if (EqualityComparer<TVal>.Default.Equals(f, v)) return false;
        f = v; OnPropertyChanged(n); return true;
    }
}

/// <summary>Chip d'un filtre ou tri actif affiché sous la barre de contrôles.</summary>
public record ActiveChip(string Id, string Label, bool IsSortChip);







