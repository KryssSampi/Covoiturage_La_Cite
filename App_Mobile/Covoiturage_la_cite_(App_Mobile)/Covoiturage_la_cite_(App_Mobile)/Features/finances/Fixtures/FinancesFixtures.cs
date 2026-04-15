// Features/finances/Fixtures/FinancesFixtures.cs

using Covoiturage_la_cite__App_Mobile_.Features.finances.DisplayModels;

namespace Covoiturage_la_cite__App_Mobile_.Features.finances.Fixtures
{
    public static class FinancesFixtures
    {
        public static BalanceHeroDisplayModel BalanceHero() => new(
            AvailableBalance: 36.30m,
            PendingBalance:    0.00m,
            PenaltyBalance:   -6.00m,
            IbanMasked:        "***-****-2918",
            CanWithdraw:       true
        );

        public static FinanceResumeDisplayModel Resume() => new(
            MonthlyGain: 40.80m, WeeklyGain: 30.60m, WeekLabel: "Sem. 13",
            Commission: 7.20m, CommissionPct: 0.15m,
            PaidTrips: 8, TotalTrips: 8,
            GrossRevenue: 48.00m, NetRevenue: 40.80m, MonthlyGoal: 200.00m,
            GrossPercent: 0.80, NetPercent: 0.68, GoalPercent: 0.20,
            InsightText: "+100% vs mois précédent · Encore 159,20 $ pour atteindre votre objectif."
        );

        public static RevenueChartDisplayModel RevenueChart() => new(
            Bars: new[]
            {
                new RevenueBarDisplayModel("S18", 10.2m, 1.00, false),
                new RevenueBarDisplayModel("S16", 10.2m, 1.00, false),
                new RevenueBarDisplayModel("S14", 10.2m, 1.00, false),
                new RevenueBarDisplayModel("S13",  0.0m, 0.15, true),
                new RevenueBarDisplayModel("S12", 10.2m, 1.00, false),
            },
            InsightText: "S18 : votre meilleure période à 10,20 $ — La tendance est encourageante."
        );

        public static TransactionListDisplayModel Transactions() => new(new[]
        {
            new TransactionDisplayModel("Réservation RSV-2026-74867 — mise en attente","2026-03-27",-6.00m,  TransactionType.Penalty),
            new TransactionDisplayModel("Retrait vers Desjardins",                      "2026-03-27",-150.00m,TransactionType.Debit),
            new TransactionDisplayModel("Dépôt initial de test",                        "2025-12-23", 2700.00m,TransactionType.Credit),
        });
    }
}
