// Features/search/DisplayModels/SearchDisplayModels.cs
// ════════════════════════════════════════════════════════════════════════
// Tous les types d'affichage de la feature Search.
// La vue ne connaît que ces records — jamais les entités domain.
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Shared.Cards.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.search.DisplayModels;

// ─── Rôle (réutilise l'enum existant du Planner) ─────────────────────────────
// UserRole.Driver    → voit des MapCircuitCardDisplayModel
// UserRole.Passenger → voit des DriverTripCardDisplayModel

// ─── Suggestion de lieu ───────────────────────────────────────────────────────

public enum SuggestionType
{
    Favorite,   // ⭐ toujours en premier
    Recent,     // 🕐 recherche récente
    Popular,    // 🔥 lieu populaire du campus
}

public record LocationSuggestionDisplayModel(
    string         Id,
    string         Label,
    string         SubLabel,
    SuggestionType Type,
    string         IconGlyph,
    string         IconBgHex,
    string         IconFgHex
);

// ─── Champ de saisie (From / To) ─────────────────────────────────────────────

public enum ActiveField { None, From, To }

public record SearchInputDisplayModel(
    string      FromText,
    string      ToText,
    ActiveField ActiveField,
    bool        FromHasValue,
    bool        ToHasValue,
    bool        CanSearch
);

// ─── MapCircuitCard (conducteur) ─────────────────────────────────────────────

public record MapCircuitCardDisplayModel(
    string    CircuitId,
    string    MapImageSource,
    string    Label,
    string    LabelColorHex,
    string    FromAddress,
    string    ToAddress,
    string    Via,
    int       DurationMinutes,
    double    DistanceKm,
    string    CtaLabel
);

// ─── Résultat de recherche (discriminant) ─────────────────────────────────────

public abstract record SearchResultItem;

public record DriverTripResultItem(
    DriverTripCardDisplayModel Card
) : SearchResultItem;

public record MapCircuitResultItem(
    MapCircuitCardDisplayModel Card
) : SearchResultItem;

// ─── État de la zone de listing ───────────────────────────────────────────────

public enum ListingState
{
    Idle,
    Loading,
    NoConnection,
    NoResult,
    Results,
}

// ─── Suggestions ─────────────────────────────────────────────────────────────

public record SuggestionListDisplayModel(
    IReadOnlyList<LocationSuggestionDisplayModel> Items,
    ActiveField                                   TargetField
);

// ─── Page complète ────────────────────────────────────────────────────────────

public record SearchPageDisplayModel(
    UserRole                  Role,
    SearchInputDisplayModel   Input,
    SuggestionListDisplayModel? Suggestions,
    IReadOnlyList<SearchResultItem> Results,
    ListingState              ListingState,
    bool                      IsFocused
);
