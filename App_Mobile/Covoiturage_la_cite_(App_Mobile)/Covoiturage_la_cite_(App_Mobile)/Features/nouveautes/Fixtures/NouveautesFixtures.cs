// ============================================================
//  Features/nouveautes/Fixtures/NouveautesFixtures.cs
// ============================================================

using Covoiturage_la_cite__App_Mobile_.Features.nouveautes.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.nouveautes.Fixtures
{
    public static class NouveautesFixtures
    {
        public static IReadOnlyList<NouveauteCardDisplayModel> All() =>
        [
            new("n1",
                Title:          "Rejoignez la communauté — La Cité Covoiturage",
                Description:    "Découvrez comment rejoindre et profiter pleinement de La Cité Covoiturage. Économisez sur vos déplacements, rencontrez des collègues et réduisez votre empreinte carbone.",
                YoutubeVideoId: "dQw4w9WgXcQ",
                DateLabel:      "1er avril 2026",
                Badge:          NouveauteBadge.New,
                BadgeLabel:     "Nouveau",
                BadgeColorHex:  "#E8F5EE",
                BadgeTextHex:   "#0F6E56"),

            new("n2",
                Title:          "GoBoard v2 — Gagnez des points à chaque trajet",
                Description:    "Le système GoBoard a été entièrement repensé. Nouveaux défis, classement mensuel, badges exclusifs. Participez et grimpez dans le classement de votre campus !",
                YoutubeVideoId: "dQw4w9WgXcQ",
                DateLabel:      "15 mars 2026",
                Badge:          NouveauteBadge.Update,
                BadgeLabel:     "Mise à jour",
                BadgeColorHex:  "#EEF3FB",
                BadgeTextHex:   "#1A56CC"),

            new("n3",
                Title:          "Messagerie intégrée — Parlez à votre conducteur",
                Description:    "Vous pouvez maintenant échanger des messages directement dans l'application avec vos conducteurs et passagers avant et pendant un trajet.",
                YoutubeVideoId: "dQw4w9WgXcQ",
                DateLabel:      "1er mars 2026",
                Badge:          NouveauteBadge.New,
                BadgeLabel:     "Nouveau",
                BadgeColorHex:  "#E8F5EE",
                BadgeTextHex:   "#0F6E56"),

            new("n4",
                Title:          "Correction — Notifications push améliorées",
                Description:    "Les notifications push étaient parfois en retard ou dupliquées. Ce problème est maintenant corrigé. Vous recevrez vos alertes en temps réel.",
                YoutubeVideoId: "dQw4w9WgXcQ",
                DateLabel:      "15 fév. 2026",
                Badge:          NouveauteBadge.Fix,
                BadgeLabel:     "Correction",
                BadgeColorHex:  "#FFF4E0",
                BadgeTextHex:   "#BA7517"),
        ];
    }
}
