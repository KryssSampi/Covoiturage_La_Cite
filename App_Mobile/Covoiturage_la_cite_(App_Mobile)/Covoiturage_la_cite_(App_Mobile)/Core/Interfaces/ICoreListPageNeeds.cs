using Covoiturage_la_cite__App_Mobile_.Core.Viewmodels;

namespace Covoiturage_la_cite__App_Mobile_.Core.Interfaces
{
    /// <summary>
    /// Common interface for list-based Page DisplayControllers.
    /// Provides access to shared deps like UserViewModel for Role/CanBeDriver.
    /// </summary>
    public interface ICoreListPageNeeds
    {
        UserViewModel UserViewModel { get; }
        // Extend for fixtures/services as needed (e.g., bool CanBeDriver => UserViewModel.Role == UserRole.Driver; )
    }
}

