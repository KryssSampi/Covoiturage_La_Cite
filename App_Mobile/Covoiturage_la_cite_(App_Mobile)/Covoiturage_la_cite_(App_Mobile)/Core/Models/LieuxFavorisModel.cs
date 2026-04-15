namespace Covoiturage_la_cite__App_Mobile_.Core.Models
{
    public record LieuxFavorisCoordonnees(double Lat, double Lng);

    public record LieuxFavorisModel(
        string Id,
        string UserId,
        string Pseudonyme,
        string Adresse,
        LieuxFavorisCoordonnees Coordonnees,
        string IconTag,
        bool IsAnchored = false,
        bool HasOffScreenButton = false
    );
}
