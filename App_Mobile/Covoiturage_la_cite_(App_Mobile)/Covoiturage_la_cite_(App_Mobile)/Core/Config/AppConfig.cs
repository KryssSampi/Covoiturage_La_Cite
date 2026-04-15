namespace Covoiturage_la_cite__App_Mobile_.Core.Config
{
    /// <summary>
    /// Configuration centrale de l'application.
    /// Modifier ServerCoreBaseUrl selon l'environnement (dev local / staging / prod).
    /// </summary>
    public static class AppConfig
    {
        // Pour dev Android émulateur : 10.0.2.2 pointe vers localhost de la machine hôte
        // Pour dev iOS simulateur : localhost
        // Pour prod : remplacer par l'URL réelle
#if DEBUG
        public static string ServerCoreBaseUrl { get; } =
#if ANDROID
            "http://10.0.2.2:5000/";
#else
            "http://localhost:5000/";
#endif
#else
        public static string ServerCoreBaseUrl { get; } = "https://api.covoiturage-lacite.com/";
#endif

        /// <summary>Active le mode fixtures (données locales) si true — utile en dev hors-réseau.</summary>
        public static bool UseFixtures { get; } =
#if DEBUG
            false; // Mettre true pour forcer les fixtures pendant le développement
#else
            false;
#endif
    }
}
