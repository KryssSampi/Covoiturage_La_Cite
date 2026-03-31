using Covoiturage_la_cite__App_Mobile_.Core.Models;

namespace Covoiturage_la_cite__App_Mobile_.Test.Fixtures
{
    public static class LieuxFavorisFixtures
    {
        public static IReadOnlyList<LieuxFavorisModel> CreateForUser(string userId)
        {
            return new List<LieuxFavorisModel>
            {
                new(
                    Id: "FAV-LOC-00001",
                    UserId: userId,
                    Pseudonyme: "Campus La Cité",
                    Adresse: "801, promenade de l'Aviation K1K 4R3, Ontario, Ottawa, Canada",
                    Coordonnees: new LieuxFavorisCoordonnees(45.439453490367846, -75.62678911601688),
                    IconTag: "campus",
                    IsAnchored: true,
                    HasOffScreenButton: true
                ),
                new(
                    Id: "FAV-LOC-00002",
                    UserId: userId,
                    Pseudonyme: "Domicile",
                    Adresse: "250 rue de la paix, Gatineau, Quebec, Canada",
                    Coordonnees: new LieuxFavorisCoordonnees(45.438, -75.72),
                    IconTag: "domicile",
                    IsAnchored: false,
                    HasOffScreenButton: true
                ),
                new(
                    Id: "FAV-LOC-1774303679413",
                    UserId: userId,
                    Pseudonyme: "Travail",
                    Adresse: "Place d'Orléans 110, Ottawa K1C 2L9 (Ontario)",
                    Coordonnees: new LieuxFavorisCoordonnees(45.4783386, -75.5158373),
                    IconTag: "autre",
                    IsAnchored: false,
                    HasOffScreenButton: false
                )
            };
        }
    }
}
