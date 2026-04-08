namespace Covoiturage_La_Cite_Server_Core_.Application.Interfaces;

/// <summary>
/// Crée atomiquement toutes les entités satellites d'un nouveau compte utilisateur.
/// Idempotent — safe à appeler plusieurs fois sur le même userId.
/// </summary>
public interface IUserProvisioningService
{
    Task ProvisionAsync(Guid userId, CancellationToken ct = default);
}
