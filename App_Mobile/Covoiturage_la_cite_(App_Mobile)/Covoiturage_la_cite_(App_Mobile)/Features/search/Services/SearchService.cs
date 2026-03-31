// Features/search/Services/SearchService.cs
// ════════════════════════════════════════════════════════════════════════
// Implémentation beta du SearchService.
// Filtre les fixtures statiques selon le texte from/to et le rôle.
// "Votre position" en from → filtre ignoré sur le départ.
// ════════════════════════════════════════════════════════════════════════

using Covoiturage_la_cite__App_Mobile_.Features.planner.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.search.DisplayModels;
using Covoiturage_la_cite__App_Mobile_.Features.search.Fixtures;

namespace Covoiturage_la_cite__App_Mobile_.Features.search.Services;

public class SearchService : ISearchService
{
    private const string CurrentLocationLabel = "Votre position";

    public async Task<IReadOnlyList<SearchResultItem>> SearchAsync(
        string from, string to, UserRole role, CancellationToken ct = default)
    {
        // Simule une latence réseau
        await Task.Delay(500, ct);

        if (role == UserRole.Driver)
            return BuildDriverResults(from, to);

        return BuildPassengerResults(from, to);
    }

    private static IReadOnlyList<SearchResultItem> BuildPassengerResults(string from, string to)
    {
        bool ignoreFrom = string.IsNullOrWhiteSpace(from) || from == CurrentLocationLabel;
        bool ignoreTo   = string.IsNullOrWhiteSpace(to);

        return SearchFixtures.PassengerResults()
            .Where(r =>
            {
                var route = r.Card.Route;
                bool fromOk = ignoreFrom ||
                    route.FromLabel.Contains(from, StringComparison.OrdinalIgnoreCase);
                bool toOk = ignoreTo ||
                    route.ToLabel.Contains(to, StringComparison.OrdinalIgnoreCase);
                return fromOk && toOk;
            })
            .Cast<SearchResultItem>()
            .ToList();
    }

    private static IReadOnlyList<SearchResultItem> BuildDriverResults(string from, string to)
    {
        // Pour le conducteur, on retourne tous les circuits (la carte Leaflet les filtre visuellement)
        return SearchFixtures.DriverCircuits()
            .Select(c =>
            {
                // Adapte les adresses aux inputs saisis
                var fromAddr = string.IsNullOrWhiteSpace(from) || from == CurrentLocationLabel
                    ? CurrentLocationLabel : from;
                var toAddr = string.IsNullOrWhiteSpace(to) ? c.Card.ToAddress : to;

                return (SearchResultItem)new MapCircuitResultItem(c.Card with
                {
                    FromAddress = fromAddr,
                    ToAddress   = toAddr,
                });
            })
            .ToList();
    }
}
