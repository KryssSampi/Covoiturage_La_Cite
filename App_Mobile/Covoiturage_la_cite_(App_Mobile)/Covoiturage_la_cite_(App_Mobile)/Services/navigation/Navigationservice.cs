// Features/shell/navigation/NavigationService.cs
// Singleton central. Orchestre TOUT le flux de navigation :
//   • Routes principales  → swap du ContentZone dans MainPage (pas de re-render chrome)
//   • Routes Shell        → GoToAsync natif (pages sans wrapper : search, flux, modales)
//
// Règle simple :
//   NavigationService.GoTo("accueil")      → MainPage swaps
//   NavigationService.Push("search")       → Shell natif, back disponible
//   NavigationService.PushModal("payment") → Shell natif modal

namespace Covoiturage_la_cite__App_Mobile_.Services.navigation
{
    // ─────────────────────────────────────────────────────────────────
    //  Contrat de navigation reçu par MainPage
    // ─────────────────────────────────────────────────────────────────
    public record MainNavRequest(string Route);

    // ─────────────────────────────────────────────────────────────────
    //  Catalogue : quelles routes restent dans le wrapper ?
    // ─────────────────────────────────────────────────────────────────
    public static class RouteRegistry
    {
        // Routes gérées par MainPage (TopBar + TabBar fixes)
        public static readonly HashSet<string> MainRoutes = new(StringComparer.OrdinalIgnoreCase)
        {
            "accueil",
            "planifier",
            "messages",
            "stats",
            "profil",
            "favoris",
        };

        // Routes poussées au Shell natif (back natif, pas de chrome custom)
        // Pages de focus total, flux, modales, search
        public static readonly HashSet<string> ShellRoutes = new(StringComparer.OrdinalIgnoreCase)
        {
            "search",
            "reservation",
            "trajet_detail",
            "payment",
            "notifications",
            "profil_detail",
            "avis",
            "login",
            "onboarding",
        };
    }

    // ─────────────────────────────────────────────────────────────────
    //  Service
    // ─────────────────────────────────────────────────────────────────
    public class NavigationService
    {
        // ── Événement : MainPage s'abonne pour swapper le contenu ──
        public event Action<MainNavRequest>? MainNavigationRequested;

        // ── Route principale courante ──
        private string _currentMainRoute = "accueil";
        public string CurrentMainRoute => _currentMainRoute;

        // ── Historique simplifié pour debug / analytics ──
        private readonly Stack<string> _history = new();
        public IReadOnlyCollection<string> History => _history;

        // ─────────────────────────────────────────────────────────────
        //  Navigation principale (reste dans MainPage)
        // ─────────────────────────────────────────────────────────────
        public void GoTo(string route)
        {
            if (!RouteRegistry.MainRoutes.Contains(route))
            {
                // Mauvais appel → redirige vers Push
                Push(route);
                return;
            }

            if (_currentMainRoute == route) return;

            _history.Push(_currentMainRoute);
            _currentMainRoute = route;

            MainThread.BeginInvokeOnMainThread(() =>
                MainNavigationRequested?.Invoke(new MainNavRequest(route)));
        }

        // ─────────────────────────────────────────────────────────────
        //  Navigation Shell (pages hors wrapper)
        // ─────────────────────────────────────────────────────────────
        public void Push(string route, Dictionary<string, object>? parameters = null)
        {
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                if (parameters is { Count: > 0 })
                    await Shell.Current.GoToAsync(route, parameters);
                else
                    await Shell.Current.GoToAsync(route);
            });
        }

        public void PushModal(string route, Dictionary<string, object>? parameters = null)
        {
            // Même chose pour l'instant — Shell gère les modales via GoToAsync
            Push(route, parameters);
        }

        // ─────────────────────────────────────────────────────────────
        //  Back natif Shell (pages hors wrapper uniquement)
        // ─────────────────────────────────────────────────────────────
        public void Pop()
        {
            MainThread.BeginInvokeOnMainThread(async () =>
                await Shell.Current.GoToAsync(".."));
        }

        // ─────────────────────────────────────────────────────────────
        //  Vérifie si une route est une route principale
        // ─────────────────────────────────────────────────────────────
        public static bool IsMainRoute(string route)
            => RouteRegistry.MainRoutes.Contains(route);
    }
}
