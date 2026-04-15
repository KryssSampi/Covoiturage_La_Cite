// Features/search/Utils/CheckConnexionUtils.cs
// ════════════════════════════════════════════════════════════════════════
// Utilitaire de vérification de la connectivité réseau.
// ════════════════════════════════════════════════════════════════════════

namespace Covoiturage_la_cite__App_Mobile_.Features.search.Utils;

public interface ICheckConnexionUtils
{
    Task<bool> IsConnectedAsync();
    bool IsConnected { get; }
}

public class CheckConnexionUtils : ICheckConnexionUtils
{
    private readonly IConnectivity _connectivity;

    public CheckConnexionUtils(IConnectivity connectivity)
    {
        _connectivity = connectivity;
    }

    public bool IsConnected
        => _connectivity.NetworkAccess == NetworkAccess.Internet;

    public async Task<bool> IsConnectedAsync()
    {
        await Task.Yield();
        return _connectivity.NetworkAccess == NetworkAccess.Internet;
    }
}
