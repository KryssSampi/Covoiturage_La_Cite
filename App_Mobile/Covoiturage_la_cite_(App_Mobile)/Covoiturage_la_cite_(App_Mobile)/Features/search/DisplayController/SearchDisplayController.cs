// Features/search/DisplayController/SearchDisplayController.cs
// ════════════════════════════════════════════════════════════════════════
// Contrôleur de la feature Search.
// Gère :
//   - État des inputs (focus, texte, can-search)
//   - Mode "Votre position" pour le champ From
//   - Affichage/masquage des suggestions
//   - Vérification connexion → ListingState
//   - Appel ISearchService → résultats
//   - Affichage de la WebView carte (conducteur uniquement, sur Results)
// ════════════════════════════════════════════════════════════════════════

using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.search.Services;
using Covoiturage_la_cite__App_Mobile_.Features.search.Utils;
using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.search.DisplayController;

public class SearchDisplayController : INotifyPropertyChanged
{
    private readonly ICheckConnexionUtils _connexion;
    private readonly ISearchService       _searchService;

    private const string CurrentLocationLabel = "Votre position";

    // ══════════════════════════════════════════════════════════════════
    // État interne
    // ══════════════════════════════════════════════════════════════════

    private UserRole     _role             = UserRole.Passenger;
    private string       _fromText         = "";
    private string       _toText           = "";
    private ActiveField  _activeField      = ActiveField.None;
    private ListingState _listingState     = ListingState.Idle;
    private bool         _isFocused        = false;
    private bool         _useCurrentLocation = false;

    private readonly List<string> _searchHistory = new();

    private readonly List<LocationSuggestionDisplayModel> _favorites = new()
    {
        new("fav-campus", "Campus La Cité",
            "801 prom. de l'Aviation, Ottawa",
            SuggestionType.Favorite, "\uF59C", "#E1F5EE", "#0F6E56"),
        new("fav-home", "Domicile",
            "Votre adresse enregistrée",
            SuggestionType.Favorite, "\uF488", "#E8F0FE", "#1A56CC"),
        new("fav-work", "Travail",
            "Votre lieu de travail",
            SuggestionType.Favorite, "\uF274", "#FAEEDA", "#854F0B"),
    };

    // ══════════════════════════════════════════════════════════════════
    // Propriétés observables — champs texte
    // ══════════════════════════════════════════════════════════════════

    public string FromText
    {
        get => _fromText;
        set
        {
            if (!Set(ref _fromText, value)) return;
            OnPropertyChanged(nameof(FromHasValue));
            OnPropertyChanged(nameof(CanSearch));
            OnPropertyChanged(nameof(InputDisplayModel));
            RefreshSuggestions();
        }
    }

    public string ToText
    {
        get => _toText;
        set
        {
            if (!Set(ref _toText, value)) return;
            OnPropertyChanged(nameof(ToHasValue));
            OnPropertyChanged(nameof(CanSearch));
            OnPropertyChanged(nameof(InputDisplayModel));
            RefreshSuggestions();
        }
    }

    public bool FromHasValue => !string.IsNullOrWhiteSpace(_fromText) || _useCurrentLocation;
    public bool ToHasValue   => !string.IsNullOrWhiteSpace(_toText);
    public bool CanSearch    => FromHasValue && ToHasValue;

    // ══════════════════════════════════════════════════════════════════
    // "Votre position" — label chip sur le champ From
    // ══════════════════════════════════════════════════════════════════

    /// <summary>true = affiche le chip "Votre position", entrée From cachée.</summary>
    public bool UseCurrentLocation
    {
        get => _useCurrentLocation;
        private set
        {
            if (!Set(ref _useCurrentLocation, value)) return;
            OnPropertyChanged(nameof(ShowFromEntry));
            OnPropertyChanged(nameof(ShowFromLocationChip));
            OnPropertyChanged(nameof(FromHasValue));
            OnPropertyChanged(nameof(CanSearch));
            OnPropertyChanged(nameof(ShowSearchButton));
        }
    }

    /// <summary>Entrée From visible si pas en mode "votre position" ET pas focus To.</summary>
    public bool ShowFromEntry        => !_useCurrentLocation && _activeField != ActiveField.To;

    /// <summary>Chip "Votre position" visible si mode activé ET pas focus To.</summary>
    public bool ShowFromLocationChip => _useCurrentLocation && _activeField != ActiveField.To;

    // ══════════════════════════════════════════════════════════════════
    // Focus
    // ══════════════════════════════════════════════════════════════════

    public ActiveField ActiveField
    {
        get => _activeField;
        private set
        {
            if (!Set(ref _activeField, value)) return;
            IsFocused = value != ActiveField.None;
            OnPropertyChanged(nameof(IsFromFocused));
            OnPropertyChanged(nameof(IsToFocused));
            OnPropertyChanged(nameof(ShowFromEntry));
            OnPropertyChanged(nameof(ShowFromLocationChip));
            OnPropertyChanged(nameof(ShowToEntry));
            OnPropertyChanged(nameof(ShowSearchButton));
            OnPropertyChanged(nameof(ShowConfirmButton));
            OnPropertyChanged(nameof(InputDisplayModel));
            RefreshSuggestions();
        }
    }

    public bool IsFocused
    {
        get => _isFocused;
        private set => Set(ref _isFocused, value);
    }

    public bool IsFromFocused => _activeField == ActiveField.From;
    public bool IsToFocused   => _activeField == ActiveField.To;
    public bool ShowToEntry   => _activeField != ActiveField.From;

    // ══════════════════════════════════════════════════════════════════
    // Boutons
    // ══════════════════════════════════════════════════════════════════

    public bool ShowSearchButton  => _activeField == ActiveField.None && CanSearch;
    public bool ShowConfirmButton => _activeField != ActiveField.None;

    // ══════════════════════════════════════════════════════════════════
    // Listing
    // ══════════════════════════════════════════════════════════════════

    public ListingState ListingState
    {
        get => _listingState;
        private set
        {
            if (!Set(ref _listingState, value)) return;
            OnPropertyChanged(nameof(ShowLoader));
            OnPropertyChanged(nameof(ShowNoConnection));
            OnPropertyChanged(nameof(ShowNoResult));
            OnPropertyChanged(nameof(ShowResults));
            OnPropertyChanged(nameof(ShowListing));
            OnPropertyChanged(nameof(ShowMapWebView));
        }
    }

    public bool ShowLoader       => _listingState == ListingState.Loading;
    public bool ShowNoConnection => _listingState == ListingState.NoConnection;
    public bool ShowNoResult     => _listingState == ListingState.NoResult;
    public bool ShowResults      => _listingState == ListingState.Results;
    public bool ShowListing      => !_isFocused && _listingState != ListingState.Idle;

    /// <summary>WebView carte visible uniquement pour le conducteur quand il y a des résultats.</summary>
    public bool ShowMapWebView => _role == UserRole.Driver && _listingState == ListingState.Results;

    // ══════════════════════════════════════════════════════════════════
    // Suggestions
    // ══════════════════════════════════════════════════════════════════

    private IReadOnlyList<LocationSuggestionDisplayModel> _suggestions = Array.Empty<LocationSuggestionDisplayModel>();
    public IReadOnlyList<LocationSuggestionDisplayModel> Suggestions
    {
        get => _suggestions;
        private set
        {
            if (!Set(ref _suggestions, value)) return;
            OnPropertyChanged(nameof(ShowSuggestions));
        }
    }

    public bool ShowSuggestions => _isFocused && _suggestions.Count > 0;

    // ══════════════════════════════════════════════════════════════════
    // Résultats
    // ══════════════════════════════════════════════════════════════════

    private IReadOnlyList<SearchResultItem> _results = Array.Empty<SearchResultItem>();
    public IReadOnlyList<SearchResultItem> Results
    {
        get => _results;
        private set => Set(ref _results, value);
    }

    // ══════════════════════════════════════════════════════════════════
    // Rôle
    // ══════════════════════════════════════════════════════════════════

    public UserRole Role
    {
        get => _role;
        private set => Set(ref _role, value);
    }

    // ── DisplayModel agrégé ──────────────────────────────────────────

    public SearchInputDisplayModel InputDisplayModel => new(
        FromText:     _useCurrentLocation ? CurrentLocationLabel : _fromText,
        ToText:       _toText,
        ActiveField:  _activeField,
        FromHasValue: FromHasValue,
        ToHasValue:   ToHasValue,
        CanSearch:    CanSearch
    );

    // ══════════════════════════════════════════════════════════════════
    // Commandes
    // ══════════════════════════════════════════════════════════════════

    public ICommand FocusFromCommand         { get; }
    public ICommand FocusToCommand           { get; }
    public ICommand ClearFocusCommand        { get; }
    public ICommand ClearFromCommand         { get; }
    public ICommand ClearToCommand           { get; }
    public ICommand ClearCurrentLocationCommand { get; }
    public ICommand SelectSuggestionCommand  { get; }
    public ICommand ConfirmInputCommand      { get; }
    public ICommand SearchCommand            { get; }
    public ICommand RetryCommand             { get; }
    public ICommand InitPageCommand          { get; }
    public ICommand SwapCommand              { get; }

    // ══════════════════════════════════════════════════════════════════
    // Constructeur
    // ══════════════════════════════════════════════════════════════════

    public SearchDisplayController(ICheckConnexionUtils connexion, ISearchService searchService)
    {
        _connexion     = connexion;
        _searchService = searchService;

        FocusFromCommand = new Command(() =>
        {
            if (_useCurrentLocation) return; // chip actif → focus désactivé sur From
            ActiveField = ActiveField.From;
        });

        FocusToCommand   = new Command(() => ActiveField = ActiveField.To);

        ClearFocusCommand = new Command(() =>
        {
            ActiveField = ActiveField.None;
            OnPropertyChanged(nameof(ShowListing));
        });

        ClearFromCommand = new Command(() =>
        {
            FromText    = "";
            ActiveField = ActiveField.From;
        });

        ClearToCommand = new Command(() =>
        {
            ToText      = "";
            ActiveField = ActiveField.To;
        });

        ClearCurrentLocationCommand = new Command(() =>
        {
            UseCurrentLocation = false;
            FromText           = "";
            ActiveField        = ActiveField.From;
        });

        SelectSuggestionCommand = new Command<LocationSuggestionDisplayModel>(suggestion =>
        {
            if (suggestion == null) return;

            if (_activeField == ActiveField.From)
                FromText = suggestion.Label;
            else
                ToText = suggestion.Label;

            if (!_searchHistory.Contains(suggestion.Label))
                _searchHistory.Insert(0, suggestion.Label);

            if (_activeField == ActiveField.From && !ToHasValue)
                ActiveField = ActiveField.To;
            else if (_activeField == ActiveField.To && !FromHasValue)
                ActiveField = _useCurrentLocation ? ActiveField.None : ActiveField.From;
            else
                ActiveField = ActiveField.None;
        });

        ConfirmInputCommand = new Command(() =>
        {
            if (CanSearch)
            {
                ActiveField = ActiveField.None;
                _ = RunSearchAsync();
            }
            else if (_activeField == ActiveField.From)
            {
                ActiveField = ActiveField.To;
            }
            else if (_activeField == ActiveField.To)
            {
                ActiveField = FromHasValue ? ActiveField.None : ActiveField.From;
            }
        });

        SearchCommand = new Command(
            execute:    () => _ = RunSearchAsync(),
            canExecute: () => CanSearch);

        RetryCommand    = new Command(() => _ = CheckAndLoadAsync());
        InitPageCommand = new Command(() => _ = CheckAndLoadAsync());

        SwapCommand = new Command(() =>
        {
            if (_useCurrentLocation)
            {
                // "Votre position" → To, ancien To → From
                var oldTo = _toText;
                UseCurrentLocation = false;
                FromText = oldTo;
                ToText   = CurrentLocationLabel;
            }
            else
            {
                var tmp  = _fromText;
                _fromText = _toText;
                _toText   = tmp;
                OnPropertyChanged(nameof(FromText));
                OnPropertyChanged(nameof(ToText));
            }
            OnPropertyChanged(nameof(FromHasValue));
            OnPropertyChanged(nameof(ToHasValue));
            OnPropertyChanged(nameof(CanSearch));
            OnPropertyChanged(nameof(InputDisplayModel));
            OnPropertyChanged(nameof(ShowSearchButton));
        });
    }

    // ══════════════════════════════════════════════════════════════════
    // API publique
    // ══════════════════════════════════════════════════════════════════

    public void SetRole(UserRole role) => Role = role;

    /// <summary>
    /// Active le mode "Votre position" sur le champ From.
    /// Le texte interne devient CurrentLocationLabel pour la recherche.
    /// </summary>
    public void SetCurrentLocation(bool use)
    {
        UseCurrentLocation = use;
        if (use) _fromText = CurrentLocationLabel;
    }

    /// <summary>Pré-remplit le champ To (depuis la HomePage par ex.).</summary>
    public void SetToText(string text)
    {
        ToText = text;
    }

    // ══════════════════════════════════════════════════════════════════
    // Vérification connexion
    // ══════════════════════════════════════════════════════════════════

    public async Task CheckAndLoadAsync()
    {
        ListingState = ListingState.Loading;
        await Task.Delay(300);

        bool connected = await _connexion.IsConnectedAsync();

        ListingState = connected ? ListingState.Idle : ListingState.NoConnection;
    }

    // ══════════════════════════════════════════════════════════════════
    // Recherche
    // ══════════════════════════════════════════════════════════════════

    private async Task RunSearchAsync()
    {
        if (!CanSearch) return;

        var query = $"{InputDisplayModel.FromText} → {_toText}";
        if (!_searchHistory.Contains(query))
            _searchHistory.Insert(0, query);

        ListingState = ListingState.Loading;

        bool connected = await _connexion.IsConnectedAsync();
        if (!connected)
        {
            ListingState = ListingState.NoConnection;
            return;
        }

        IReadOnlyList<SearchResultItem> serviceResults;
        try
        {
            serviceResults = await _searchService.SearchAsync(
                _useCurrentLocation ? CurrentLocationLabel : _fromText,
                _toText,
                _role);
        }
        catch (OperationCanceledException)
        {
            return;
        }

        if (serviceResults == null || serviceResults.Count == 0)
        {
            ListingState = ListingState.NoResult;
            return;
        }

        Results = serviceResults;
        ListingState = ListingState.Results;
    }

    // ══════════════════════════════════════════════════════════════════
    // Suggestions
    // ══════════════════════════════════════════════════════════════════

    private void RefreshSuggestions()
    {
        if (_activeField == ActiveField.None)
        {
            Suggestions = Array.Empty<LocationSuggestionDisplayModel>();
            return;
        }

        // Construire la liste complète en mémoire, puis assigner en 1 bloc
        var result = new List<LocationSuggestionDisplayModel>();
        string query = _activeField == ActiveField.From ? _fromText : _toText;

        var filtered = string.IsNullOrWhiteSpace(query)
            ? _favorites
            : _favorites.Where(f =>
                f.Label.Contains(query, StringComparison.OrdinalIgnoreCase) ||
                f.SubLabel.Contains(query, StringComparison.OrdinalIgnoreCase)).ToList();

        result.AddRange(filtered);

        var recentFiltered = string.IsNullOrWhiteSpace(query)
            ? _searchHistory.Take(5)
            : _searchHistory
                .Where(h => h.Contains(query, StringComparison.OrdinalIgnoreCase))
                .Take(5);

        foreach (var recent in recentFiltered)
        {
            if (result.Any(s => s.Label == recent)) continue;
            result.Add(new LocationSuggestionDisplayModel(
                Id:        $"recent_{recent.GetHashCode()}",
                Label:     recent,
                SubLabel:  "Recherche récente",
                Type:      SuggestionType.Recent,
                IconGlyph: "\uF150",
                IconBgHex: "#EEF0F5",
                IconFgHex: "#545D6E"
            ));
        }

        if (string.IsNullOrWhiteSpace(query))
        {
            var populars = new[]
            {
                new LocationSuggestionDisplayModel(
                    "pop-orleans", "Place d'Orléans",
                    "Centre commercial, Ottawa-Est",
                    SuggestionType.Popular, "\uF6E0", "#FAEEDA", "#BA7517"),
                new LocationSuggestionDisplayModel(
                    "pop-barrhaven", "Barrhaven Town Centre",
                    "Barrhaven, Ottawa",
                    SuggestionType.Popular, "\uF6E0", "#FAEEDA", "#BA7517"),
                new LocationSuggestionDisplayModel(
                    "pop-hurdman", "Arrêt Hurdman",
                    "Station OC Transpo",
                    SuggestionType.Popular, "\uF5B6", "#E8F0FE", "#1A56CC"),
            };

            foreach (var pop in populars)
            {
                if (!result.Any(s => s.Label == pop.Label))
                    result.Add(pop);
            }
        }

        // 1 seule assignation → 1 seule notification, 1 seul re-render
        Suggestions = result;
    }

    // ══════════════════════════════════════════════════════════════════
    // INotifyPropertyChanged
    // ══════════════════════════════════════════════════════════════════

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string? n = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(n));
    private bool Set<T>(ref T f, T v, [CallerMemberName] string? n = null)
    {
        if (EqualityComparer<T>.Default.Equals(f, v)) return false;
        f = v; OnPropertyChanged(n); return true;
    }
}
