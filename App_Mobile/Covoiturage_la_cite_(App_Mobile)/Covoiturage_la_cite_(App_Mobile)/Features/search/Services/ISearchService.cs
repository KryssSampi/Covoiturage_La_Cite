// Features/search/Services/ISearchService.cs
// ════════════════════════════════════════════════════════════════════════
// Contrat du service de recherche.
// La beta utilise des fixtures statiques filtrées par texte.
// La version réelle appellera l'API et OsrmService.
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.search.Services;

public interface ISearchService
{
    /// <summary>
    /// Recherche des trajets ou circuits selon le rôle.
    /// Passenger → DriverTripResultItem (liste de conducteurs disponibles)
    /// Driver    → MapCircuitResultItem (circuits recommandés)
    /// </summary>
    Task<IReadOnlyList<SearchResultItem>> SearchAsync(
        string from, string to, UserRole role, CancellationToken ct = default);
}
