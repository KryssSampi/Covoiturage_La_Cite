// Features/goboard/Fixtures/GoboardFixtures.cs

using Covoiturage_la_cite__App_Mobile_.Features.goboard.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.goboard.Fixtures
{
    public static class GoboardFixtures
    {
        public static GoScoreHeroDisplayModel GoScoreHero() => new(
            Score: 520, MaxScore: 1000, GaugePercent: 0.52,
            RankEmoji: "🥉", RankLabel: "#4 ce mois", LevelLabel: "Intermédiaire"
        );

        public static GoTaskListDisplayModel TaskList() => new(
            Tasks: new[]
            {
                new GoTaskDisplayModel("t1", "Compléter votre profil",
                    "Ajoutez une photo, une bio et vos préférences.", 50, GoTaskStatus.Done),
                new GoTaskDisplayModel("t2", "Terminer votre premier trajet",
                    "En tant que passager ou conducteur.", 30, GoTaskStatus.Done),
                new GoTaskDisplayModel("t3", "Effectuer 3 trajets cette semaine",
                    "Participez à 3 trajets pour gagner des points.", 20, GoTaskStatus.Todo),
                new GoTaskDisplayModel("t4", "Inviter un ami de La Cité",
                    "Partagez votre lien d'invitation.", 10, GoTaskStatus.Todo),
                new GoTaskDisplayModel("t5", "Laisser votre premier avis",
                    "Après un trajet complété.", 15, GoTaskStatus.Done),
            },
            PotentialPoints: 30
        );

        public static LeaderboardDisplayModel Leaderboard() => new(
            Entries: new[]
            {
                new RankEntryDisplayModel(1,"🥇","ML","#FEF3C7","#92400E","Marie-Claude L.",980,false),
                new RankEntryDisplayModel(2,"🥈","JP","#EEF0F5","#545D6E","Jean-Pierre M.",942,false),
                new RankEntryDisplayModel(3,"🥉","SB","#FAEEDA","#854F0B","Sofia B.",      895,false),
                new RankEntryDisplayModel(4,"",  "Moi","#E8F0FE","#1A56CC","Vous",         520,true),
                new RankEntryDisplayModel(5,"",  "PD","#E1F5EE","#0F6E56","Pauline D.",    310,false),
            },
            TotalParticipants: 8,
            HiddenCount: 3
        );

        public static EcoChallengesDisplayModel EcoChallenges() => new(
            Challenges: new[]
            {
                new EcoChallengeDisplayModel("🌱","Éco-Débutant",
                    "Faites vos premiers pas écologiques en économisant 10 kg de CO₂.",
                    1.0, "Cible : 10 kg CO₂", EcoChallengeStatus.Completed, null),
                new EcoChallengeDisplayModel("🌿","Éco-Conscient",
                    "Atteignez 50 kg de CO₂ économisés — chaque trajet partagé compte.",
                    1.0, "Cible : 50 kg CO₂", EcoChallengeStatus.Completed, null),
                new EcoChallengeDisplayModel("🌳","Éco-Warrior",
                    "Devenez champion de l'environnement en économisant 200 kg de CO₂.",
                    0.73, "Cible : 200 kg CO₂", EcoChallengeStatus.InProgress,
                    "🏅 Badge Expert Éco à débloquer"),
            }
        );

        public static ScoreHistoryDisplayModel ScoreHistory() => new(
            Entries: new[]
            {
                new ScoreHistoryEntryDisplayModel("Go!Tâche — Atteindre 500 points",    "1 mars 2026",   100),
                new ScoreHistoryEntryDisplayModel("Go!Tâche — Premier avis après trajet","18 fév. 2026",  15),
                new ScoreHistoryEntryDisplayModel("Go!Tâche — Terminer votre premier trajet","3 fév. 2026",30),
            },
            TotalAccumulated: 520,
            TotalEvents: 12
        );
    }
}
